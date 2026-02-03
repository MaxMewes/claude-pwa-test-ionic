/**
 * Test Infrastructure - Barrel Export
 *
 * Usage in tests:
 * ```tsx
 * import { renderWithProviders, createMockLabResult, server } from '../test';
 * ```
 */

// Test utilities
export * from './test-utils';

// Data factories
export * from './factories';

// MSW mocks
export { server, handlers, errorHandlers } from './mocks';
