import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Theme, ColorScheme } from '../types';

interface ThemeContextType {
    theme: Theme;
    colorScheme: ColorScheme;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');
    const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
    const [isInitialized, setIsInitialized] = useState(false);

    // Load theme from storage on mount
    useEffect(() => {
        const loadSettings = async () => {
            let savedTheme: Theme | null = null;
            let savedScheme: ColorScheme | null = null;

            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get(['theme', 'colorScheme']);
                if (result.theme) savedTheme = result.theme as Theme;
                if (result.colorScheme) savedScheme = result.colorScheme as ColorScheme;
            } else {
                // Fallback to localStorage for development
                savedTheme = localStorage.getItem('scholar-theme') as Theme;
                savedScheme = localStorage.getItem('scholar-colorScheme') as ColorScheme;
            }

            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                 // Detect system preference only if no saved theme
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(prefersDark ? 'dark' : 'light');
            }

            if (savedScheme) {
                setColorScheme(savedScheme);
            }

            setIsInitialized(true);
        };

        loadSettings();
    }, []);

    // Save theme changes
    useEffect(() => {
        if (!isInitialized) return;

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ theme, colorScheme });
        } else {
            localStorage.setItem('scholar-theme', theme);
            localStorage.setItem('scholar-colorScheme', colorScheme);
        }
    }, [theme, colorScheme, isInitialized]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
