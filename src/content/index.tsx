import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from './index.css?inline';

console.log('Scholar 2.6: Content script loaded');

// 1. Create the Host Element
const hostId = 'scholar-2-6-overlay-host';
let host = document.getElementById(hostId);

if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    host.style.position = 'fixed';
    host.style.zIndex = '2147483647'; // Max Z-Index
    host.style.top = '0';
    host.style.right = '0';
    host.style.pointerEvents = 'none'; // Allow clicks through
    document.body.appendChild(host);

    console.log('Scholar 2.6: Host element created');
}

// 2. Attach Shadow DOM (Open Mode for debugging)
const shadow = host.attachShadow({ mode: 'open' });

// 3. Inject Styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
shadow.appendChild(styleSheet);

// 4. Create React Root Container
const rootContainer = document.createElement('div');
rootContainer.id = 'root';
rootContainer.style.pointerEvents = 'auto'; // Enable clicks on our UI
shadow.appendChild(rootContainer);

// 5. Mount React
const root = createRoot(rootContainer);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

console.log('Scholar 2.6: React app mounted in Shadow DOM');

export { };
