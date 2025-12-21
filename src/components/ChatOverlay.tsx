import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Download, Mic, MicOff, Moon, Sun, Globe, Settings, ArrowLeft, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useResearchAgent } from '../hooks/useResearchAgent';
import { useTheme } from '../context/ThemeContext';
import { VoiceRecognition } from '../utils/voiceRecognition';
import { exportChatToMarkdown, exportChatToJSON, downloadFile } from '../utils/exportUtils';
import { SettingsView } from './SettingsView';
import type { GraphData } from '../types';

interface ChatOverlayProps {
    onResearchReady: (data: GraphData) => void;
    onClose: () => void;
}

// Smart research topic suggestions
const researchSuggestions = [
    'Computer Vision',
    'Natural Language Processing',
    'Reinforcement Learning',
    'Graph Neural Networks',
    'Quantum Computing',
    'Federated Learning',
    'Transformer Architecture',
    'Few-Shot Learning',
    'Explainable AI',
    'Edge Computing'
];

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ onResearchReady, onClose }) => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const voiceRecognitionRef = useRef<VoiceRecognition>(new VoiceRecognition());

    const { messages, sendMessage, isThinking } = useResearchAgent(onResearchReady);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['chatHistory'], () => {
                // Could restore previous conversations if needed
            });
        }
    }, []);

    // Save chat history
    useEffect(() => {
        if (messages.length > 1) {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ chatHistory: messages });
            } else {
                localStorage.setItem('scholar-chat-history', JSON.stringify(messages));
            }
        }
    }, [messages]);

    // Smart suggestions based on input
    useEffect(() => {
        if (input.length > 2) {
            const filtered = researchSuggestions.filter(s =>
                s.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 3);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() && !isThinking) {
            sendMessage(input);
            setInput('');
            setSuggestions([]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        setSuggestions([]);
    };

    // Voice input
    const handleVoiceInput = () => {
        if (!voiceRecognitionRef.current.isSupported()) {
            alert('Voice recognition not supported in your browser');
            return;
        }

        if (isListening) {
            voiceRecognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            voiceRecognitionRef.current.start(
                (transcript) => {
                    setInput(transcript);
                    setIsListening(false);
                },
                (error) => {
                    console.error('Voice recognition error:', error);
                    setIsListening(false);
                }
            );
        }
    };

    // Export chat
    const handleExportMarkdown = () => {
        const markdown = exportChatToMarkdown(messages);
        downloadFile(markdown, 'scholar-chat.md', 'text/markdown');
        setShowExportMenu(false);
    };

    const handleExportJSON = () => {
        const json = exportChatToJSON(messages);
        downloadFile(json, 'scholar-chat.json', 'application/json');
        setShowExportMenu(false);
    };

    // Language switcher
    const cycleLanguage = () => {
        const languages = ['en', 'es', 'zh'];
        const currentIndex = languages.indexOf(i18n.language);
        const nextIndex = (currentIndex + 1) % languages.length;
        i18n.changeLanguage(languages[nextIndex]);
    };

    return (
        <div className={`fixed bottom-6 right-6 w-96 h-[600px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
                <div>
                    {showSettings ? (
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setShowSettings(false)}
                                className="hover:bg-white/20 p-1.5 rounded transition"
                             >
                                <ArrowLeft size={20} />
                             </button>
                             <h3 className="font-bold text-lg">Settings</h3>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-bold text-lg">{t('chat.title')}</h3>
                            <p className="text-xs opacity-90">{t('chat.subtitle')}</p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!showSettings && (
                        <>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="hover:bg-white/20 p-1.5 rounded transition"
                                title="Settings"
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                onClick={cycleLanguage}
                                className="hover:bg-white/20 p-1.5 rounded transition"
                                title="Change language"
                            >
                                <Globe size={18} />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="hover:bg-white/20 p-1.5 rounded transition"
                                title={t('action.theme')}
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <a
                                href="https://buymeacoffee.com/jackami"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:bg-white/20 p-1.5 rounded transition text-white"
                                title="Buy Me a Coffee"
                            >
                                <Coffee size={18} />
                            </a>
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="hover:bg-white/20 p-1.5 rounded transition"
                                    title={t('action.export')}
                                >
                                    <Download size={18} />
                                </button>
                                {showExportMenu && (
                                    <div className={`absolute right-0 top-full mt-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} rounded-lg shadow-xl py-2 min-w-[150px] z-10`}>
                                        <button
                                            onClick={handleExportMarkdown}
                                            className={`w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                                        >
                                            Export as Markdown
                                        </button>
                                        <button
                                            onClick={handleExportJSON}
                                            className={`w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-slate-600 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                                        >
                                            Export as JSON
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-1.5 rounded transition"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {showSettings ? (
                <SettingsView onClose={() => setShowSettings(false)} />
            ) : (
                <>
                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}
                            >
                                {msg.role !== 'user' && (
                                    <img
                                        src={typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.getURL('logo.png') : 'logo.png'}
                                        alt="AI"
                                        className="w-8 h-8 rounded-full object-cover shadow-sm mb-1"
                                    />
                                )}
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : theme === 'dark'
                                            ? 'bg-slate-800 text-white shadow-sm'
                                            : 'bg-white text-gray-800 shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isThinking && (
                            <div className="flex justify-start">
                                <div className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} p-3 rounded-lg shadow-sm flex items-center gap-2`}>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">{t('chat.thinking')}</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-t`}>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className={`px-3 py-1 text-xs rounded-full ${theme === 'dark'
                                            ? 'bg-slate-700 text-white hover:bg-slate-600'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            } transition`}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-t`}>
                        <div className="flex gap-2">
                            <button
                                onClick={handleVoiceInput}
                                disabled={isThinking}
                                className={`p-2 rounded-lg transition ${isListening
                                    ? 'bg-red-600 text-white'
                                    : theme === 'dark'
                                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    } disabled:opacity-50`}
                                title={t('action.voice')}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chat.placeholder')}
                                className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark'
                                    ? 'bg-slate-700 text-white placeholder-gray-400 border-slate-600'
                                    : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-300'
                                    } border`}
                                disabled={isThinking}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isThinking}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
