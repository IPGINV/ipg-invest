import React from 'react';
import ReactDOM, { type Root } from 'react-dom/client';
import App from './App';

const mount = (element: Element) => {
  const root = ReactDOM.createRoot(element);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  return root;
};

class IpgCalculatorElement extends HTMLElement {
  root?: Root;

  connectedCallback() {
    if (this.root) return;
    const container = document.createElement('div');
    this.appendChild(container);
    this.root = mount(container);
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }
}

if (!customElements.get('ipg-calculator')) {
  customElements.define('ipg-calculator', IpgCalculatorElement);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  mount(rootElement);
}