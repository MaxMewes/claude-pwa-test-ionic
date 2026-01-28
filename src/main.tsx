import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './config/queryClient';
import { axiosInstance } from './api/client/axiosInstance';
import { setupMockAdapter } from './api/client/mockAdapter';
import './config/i18n';

// Setup mock API for development
if (import.meta.env.DEV) {
  setupMockAdapter(axiosInstance);
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
