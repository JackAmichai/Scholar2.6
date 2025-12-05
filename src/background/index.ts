/// <reference types="chrome"/>
// Background Service Worker for Scholar 2.6
console.log('Scholar 2.6: Background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Scholar 2.6 installed successfully');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('Background received message:', message);

    // Proxy API calls if needed (for security)
    if (message.type === 'API_CALL') {
        // Future: Proxy OpenAI calls through backend
        sendResponse({ success: true });
    }

    return true; // Keep channel open for async response
});

export { };
