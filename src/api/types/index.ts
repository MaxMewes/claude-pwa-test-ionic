/**
 * @deprecated This file is being split into domain-specific type files.
 * Please import from the specific domain files instead:
 * - Auth types: import from './auth'
 * - Result types: import from './results'
 * - Patient types: import from './patients'
 * - Response types: import from './responses'
 * 
 * This file will be maintained for backwards compatibility but new types
 * should be added to the appropriate domain file.
 */

// Re-export all types from domain-specific files
export * from './auth';
export * from './results';
export * from './patients';
export * from './responses';
