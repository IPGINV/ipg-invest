import React from 'react';
import ReactDOM, { type Root } from 'react-dom/client';
import App from './App';

type AppProps = {
  apiBase?: string;
  userId?: string;
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

class IpgWalletElement extends HTMLElement {
  root?: Root;

  connectedCallback() {
    if (this.root) return;
    const container = document.createElement('div');
    this.appendChild(container);
    const apiBase = this.getAttribute('data-api-base') || undefined;
    const userId = this.getAttribute('data-user-id') || undefined;
    this.root = mount(container, { apiBase, userId });
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }
}

if (!customElements.get('ipg-wallet')) {
  customElements.define('ipg-wallet', IpgWalletElement);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  mount(rootElement);
}
