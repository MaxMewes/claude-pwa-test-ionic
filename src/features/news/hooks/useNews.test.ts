import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock axios
vi.mock('../../../api/client/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock authStore
vi.mock('../../auth/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: true,
  })),
}));

import { useNews, useNewsArticle, useMarkNewsAsRead } from './useNews';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { useAuthStore } from '../../auth/store/authStore';

const mockAxios = vi.mocked(axiosInstance);
const mockUseAuthStore = vi.mocked(useAuthStore);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
    } as ReturnType<typeof useAuthStore>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch news list when authenticated', async () => {
    const mockNews = [
      { Id: 1, Title: 'News 1' },
      { Id: 2, Title: 'News 2' },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: mockNews,
        CurrentPage: 1,
        ItemsPerPage: 25,
        TotalItemsCount: 2,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNews(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].Results).toEqual(mockNews);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/news', {
      params: expect.objectContaining({
        itemsPerPage: 25,
        currentPage: 1,
      }),
    });
  });

  it('should not fetch when not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>);

    const wrapper = createWrapper();
    renderHook(() => useNews(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should handle empty Items array', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: [],
        TotalItemsCount: 0,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNews(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].Results).toEqual([]);
  });

  it('should calculate total pages correctly', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: [],
        TotalItemsCount: 100,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNews(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    // 100 items / 25 per page = 4 pages
    expect(result.current.data?.pages[0].TotalPages).toBe(4);
  });
});

describe('useNewsArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single news article by ID', async () => {
    const mockArticle = {
      Id: 1,
      Title: 'Test Article',
      Content: 'Article content',
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockArticle });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNewsArticle('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockArticle);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/news/1');
  });

  it('should not fetch when ID is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => useNewsArticle(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});

describe('useMarkNewsAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API to mark news as read', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkNewsAsRead(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/news/1/read');
  });
});
