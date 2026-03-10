import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const getApiBase = (): string | undefined => {
  const override = (window as any).__IPG_API_BASE;
  if (override) return override;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  return isLocal ? 'http://localhost:3005' : 'https://api.ipg-invest.ae';
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App apiBase={getApiBase()} />
    </StrictMode>,
  );
}
