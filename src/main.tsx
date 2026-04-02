import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

const normalizeApiBase = (value?: string): string => {
  if (!value) return '';
  return value.replace(/\/+$/, '');
};

const API_BASE_URL = normalizeApiBase(import.meta.env.VITE_API_URL);

const installApiFetchProxy = () => {
  if (!API_BASE_URL || typeof window === 'undefined') {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    let target = input;

    if (typeof input === 'string' && input.startsWith('/api')) {
      target = `${API_BASE_URL}${input}`;
    }

    if (input instanceof URL && input.pathname.startsWith('/api') && input.origin === window.location.origin) {
      target = new URL(`${API_BASE_URL}${input.pathname}${input.search}`);
    }

    return originalFetch(target, init);
  };
};

installApiFetchProxy();

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <Provider store={store}>
        <App />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);
