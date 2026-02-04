/**
 * Shared axios mock utilities for tests
 *
 * Usage in test files:
 * ```
 * import { mockAxiosGet, mockAxiosPatch, mockAxiosPost, mockAxiosDelete, setupAxiosMock } from '../../../test/mockAxios';
 *
 * vi.mock('../../../api/client/axiosInstance', () => setupAxiosMock());
 *
 * // In tests:
 * mockAxiosGet.mockResolvedValueOnce({ data: {...} });
 * ```
 */
import { vi } from 'vitest';

// Create typed mock functions
export const mockAxiosGet = vi.fn();
export const mockAxiosPatch = vi.fn();
export const mockAxiosPost = vi.fn();
export const mockAxiosDelete = vi.fn();
export const mockAxiosPut = vi.fn();

// Factory function for vi.mock
export const setupAxiosMock = () => ({
  axiosInstance: {
    get: mockAxiosGet,
    patch: mockAxiosPatch,
    post: mockAxiosPost,
    delete: mockAxiosDelete,
    put: mockAxiosPut,
  },
});

// Reset all mocks between tests
export const resetAxiosMocks = () => {
  mockAxiosGet.mockReset();
  mockAxiosPatch.mockReset();
  mockAxiosPost.mockReset();
  mockAxiosDelete.mockReset();
  mockAxiosPut.mockReset();
};
