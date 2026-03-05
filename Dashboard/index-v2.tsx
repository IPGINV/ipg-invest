import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppV2 from './AppV2';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<AppV2 />);
}
