import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers for browser environment
export const worker = setupWorker(...handlers);
