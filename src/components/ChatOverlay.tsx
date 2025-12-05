import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useResearchAgent } from '../hooks/useResearchAgent';
import type { GraphData } from '../types';

interface ChatOverlayProps {
    onResearchReady: (data: GraphData) => void;
    onClose: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ onResearchReady, onClose }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, isThinking } = useResearchAgent(onResearchReady);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (input.trim() && !isThinking) {
            sendMessage(input);
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">Scholar 2.6</h3>
                    <p className="text-xs opacity-90">AI Research Navigator</p>
                </div>
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 p-1 rounded transition"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-800 shadow-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your response..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
    );
};
