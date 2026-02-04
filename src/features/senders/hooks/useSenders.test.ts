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

// Mock authStore
vi.mock('../../auth/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: true,
  })),
}));

import { useSenders, useSender } from './useSenders';
import { useAuthStore } from '../../auth/store/authStore';

const mockAxios = { get: mockGet };
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

describe('useSenders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
    } as ReturnType<typeof useAuthStore>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch senders list when authenticated', async () => {
    const mockSenders = [
      { Id: 1, Firstname: 'John', Lastname: 'Doe', LaboratoryId: 1 },
      { Id: 2, Firstname: 'Jane', Lastname: 'Smith', LaboratoryId: 1 },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Senders: mockSenders,
        TotalCount: 2,
        CurrentPage: 1,
        TotalPages: 1,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSenders(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.senders).toEqual(mockSenders);
    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/v3/senders'));
  });

  it('should not fetch when not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>);

    const wrapper = createWrapper();
    renderHook(() => useSenders(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should include query parameter when provided', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { Senders: [], TotalCount: 0 },
    });

    const wrapper = createWrapper();
    renderHook(() => useSenders({ query: 'Dr. Smith' }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('query=Dr.%20Smith'));
  });

  it('should handle empty senders array', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { Senders: [] },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSenders(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.senders).toEqual([]);
  });

  it('should calculate total pages from total count', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Senders: [],
        TotalCount: 75,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSenders(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    // 75 items / 25 per page = 3 pages
    expect(result.current.data?.pages[0].TotalPages).toBe(3);
  });
});

describe('useSender', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single sender by ID', async () => {
    const mockSender = {
      Id: 1,
      Firstname: 'John',
      Lastname: 'Doe',
      LaboratoryId: 1,
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockSender });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSender(1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockSender);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/senders/1');
  });

  it('should not fetch when ID is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => useSender(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });
});
