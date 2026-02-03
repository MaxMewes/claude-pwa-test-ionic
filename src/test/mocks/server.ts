/**
 * MSW Server Setup for Node.js (Vitest)
 *
 * This server intercepts network requests during tests.
 * Import and use in setupTests.ts or individual test files.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the MSW server with default handlers
export const server = setupServer(...handlers);

// Export for convenience
export { handlers };
