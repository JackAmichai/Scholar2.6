import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type ColorScheme = 'default' | 'ocean' | 'sunset' | 'forest' | 'neon';

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

    // Load theme from storage on mount
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['theme', 'colorScheme'], (result: any) => {
                if (result.theme) setTheme(result.theme);
                if (result.colorScheme) setColorScheme(result.colorScheme);
            });
        } else {
            // Fallback to localStorage for development
            const savedTheme = localStorage.getItem('scholar-theme') as Theme;
            const savedScheme = localStorage.getItem('scholar-colorScheme') as ColorScheme;
            if (savedTheme) setTheme(savedTheme);
            if (savedScheme) setColorScheme(savedScheme);
        }

        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark && theme === 'light') {
            setTheme('dark');
        }
    }, []);

    // Save theme changes
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ theme, colorScheme });
        } else {
            localStorage.setItem('scholar-theme', theme);
            localStorage.setItem('scholar-colorScheme', colorScheme);
        }
    }, [theme, colorScheme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Color scheme definitions
export const colorSchemes: Record<ColorScheme, string[]> = {
    default: ['#F87171', '#FB923C', '#FBBF24', '#A3E635', '#34D399', '#22D3EE', '#60A5FA', '#A78BFA'],
    ocean: ['#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E', '#083344', '#164E63', '#155E75'],
    sunset: ['#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12', '#FB923C', '#FDBA74', '#FED7AA'],
    forest: ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D', '#4ADE80', '#86EFAC', '#BBF7D0'],
    neon: ['#EC4899', '#D946EF', '#A855F7', '#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#14B8A6']
};
