import React from 'react';
import ReactDOM, { type Root } from 'react-dom/client';
import App from './App';

type AppProps = {
  apiBase?: string;
};

const mount = (element: Element, props?: AppProps) => {
  const root = ReactDOM.createRoot(element);
  root.render(
    <React.StrictMode>
      <App {...props} />
    </React.StrictMode>
  );
  return root;
};

class IpgInfoElement extends HTMLElement {
  root?: Root;

  connectedCallback() {
    if (this.root) return;
    const container = document.createElement('div');
    this.appendChild(container);
    const apiBase = this.getAttribute('data-api-base') || undefined;
    this.root = mount(container, { apiBase });
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }
}

if (!customElements.get('ipg-info')) {
  customElements.define('ipg-info', IpgInfoElement);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  mount(rootElement);
}