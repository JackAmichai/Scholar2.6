import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FABProps {
    onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center text-white z-50"
            title="Open Scholar 2.6"
        >
            <MessageCircle size={24} />
        </button>
    );
};
