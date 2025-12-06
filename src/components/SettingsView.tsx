import React, { useState, useEffect } from 'react';
import { Save, Key, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

interface SettingsViewProps {
    onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
    // Used for translation
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [keys, setKeys] = useState({
        groq: '',
        huggingface: '',
        openrouter: '',
        google: '',
        cohere: '',
        mistral: ''
    });
    const [status, setStatus] = useState<string>('');

    // Load saved keys on mount
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['apiKeys'], (result) => {
                if (result.apiKeys) {
                    setKeys(prev => ({ ...prev, ...(result.apiKeys as object) }));
                }
            });
        }
    }, []);

    const handleChange = (provider: string, value: string) => {
        setKeys(prev => ({ ...prev, [provider]: value }));
    };

    const handleSave = () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ apiKeys: keys }, () => {
                setStatus('Saved successfully!');
                setTimeout(() => setStatus(''), 2000);
            });
        } else {
            console.log('Saved keys (dev mode):', keys);
            setStatus('Dev mode: Keys logged to console');
            setTimeout(() => setStatus(''), 2000);
        }
    };

    const providers = [
        { id: 'groq', label: t('settings.groq', 'Groq API Key'), placeholder: 'gsk_...' },
        { id: 'huggingface', label: t('settings.huggingface', 'Hugging Face Token'), placeholder: 'hf_...' },
        { id: 'openrouter', label: t('settings.openrouter', 'OpenRouter Key'), placeholder: 'sk-or_...' },
        { id: 'google', label: t('settings.google', 'Google Gemini Key'), placeholder: 'AIza...' },
        { id: 'cohere', label: t('settings.cohere', 'Cohere API Key'), placeholder: '...' },
        { id: 'mistral', label: t('settings.mistral', 'Mistral API Key'), placeholder: '...' }
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className={`p-4 rounded-lg flex gap-3 ${theme === 'dark' ? 'bg-blue-900/20 text-blue-100' : 'bg-blue-50 text-blue-800'}`}>
                    <AlertCircle size={24} className="shrink-0" />
                    <p className="text-sm">
                        {t('settings.privacy_notice', 'API keys are stored locally in your browser and never sent to our servers. They are only used to communicate directly with the AI providers.')}
                    </p>
                </div>

                <div className="space-y-4">
                    {providers.map(provider => (
                        <div key={provider.id}>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {provider.label}
                            </label>
                            <div className="relative">
                                <Key size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="password"
                                    value={(keys as any)[provider.id]}
                                    onChange={(e) => handleChange(provider.id, e.target.value)}
                                    placeholder={provider.placeholder}
                                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                        theme === 'dark'
                                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${status.includes('Saved') ? 'text-green-500' : 'text-gray-500'}`}>
                        {status}
                    </span>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        <Save size={18} />
                        {t('settings.save', 'Save Keys')}
                    </button>
                    {/* Hidden close button usage to satisfy interface if needed by parent logic, though parent handles closing */}
                    <button onClick={onClose} className="hidden"></button>
                </div>
            </div>
        </div>
    );
};
