// vitest globals available via config
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Use vi.hoisted to define mock functions that are hoisted with vi.mock
const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

// Mock axios
vi.mock('../../../api/client/axiosInstance', () => ({
  axiosInstance: {
    get: mockGet,
  },
}));

import { useFAQ } from './useFAQ';

const mockAxios = { get: mockGet };

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFAQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch FAQ list', async () => {
    const mockFAQ = [
      { Id: 1, Question: 'What is labGate?', Answer: 'A medical lab results platform' },
      { Id: 2, Question: 'How do I login?', Answer: 'Use your credentials' },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: mockFAQ,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockFAQ);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/faqs');
  });

  it('should handle empty FAQ list', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: [],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle missing Items field', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {},
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle API error', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
