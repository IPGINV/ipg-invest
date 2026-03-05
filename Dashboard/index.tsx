import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './AppV2';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // StrictMode intentionally disabled to avoid duplicate dev effects.
    <App />
  );
}
