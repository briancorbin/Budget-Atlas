import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Self-hosted fonts via @fontsource — no Google Fonts CDN.
// Fraunces (display): variable font covers all weights + opsz axis we use.
// IBM Plex Sans (body): weights 300 / 400 / 500 / 600.
// IBM Plex Mono (mono): weights 300 / 400 / 500.
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/ibm-plex-sans/300.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/400-italic.css';
import '@fontsource/ibm-plex-mono/300.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
