import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock axios
vi.mock('../../../api/client/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

import { useFAQ } from './useFAQ';
import { axiosInstance } from '../../../api/client/axiosInstance';

const mockAxios = vi.mocked(axiosInstance);

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
        Results: mockFAQ,
        TotalCount: 2,
        CurrentPage: 1,
        TotalPages: 1,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].Results).toEqual(mockFAQ);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/faq', {
      params: {
        itemsPerPage: 25,
        currentPage: 1,
      },
    });
  });

  it('should handle empty FAQ list', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Results: [],
        TotalCount: 0,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].Results).toEqual([]);
    expect(result.current.data?.pages[0].TotalPages).toBe(0);
  });

  it('should calculate total pages from total count', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Results: [],
        TotalCount: 75,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    // 75 items / 25 per page = 3 pages
    expect(result.current.data?.pages[0].TotalPages).toBe(3);
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

  it('should use TotalPages from response when available', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Results: [],
        TotalCount: 100,
        TotalPages: 10,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].TotalPages).toBe(10);
  });

  it('should fallback to Results length when TotalCount is missing', async () => {
    const mockFAQ = [
      { Id: 1, Question: 'Q1', Answer: 'A1' },
      { Id: 2, Question: 'Q2', Answer: 'A2' },
      { Id: 3, Question: 'Q3', Answer: 'A3' },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Results: mockFAQ,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useFAQ(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].TotalCount).toBe(3);
  });
});
