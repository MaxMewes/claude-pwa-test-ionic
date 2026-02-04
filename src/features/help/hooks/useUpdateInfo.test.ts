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

import { useUpdateInfo } from './useUpdateInfo';

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

describe('useUpdateInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch update info with version parameter', async () => {
    const mockUpdateInfo = {
      CurrentVersion: '1.0.0',
      MinimumVersion: '0.5.0',
      UpdateType: 'Optional' as const,
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockUpdateInfo });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateInfo(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockUpdateInfo);
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/api/v3/mobile-apps/update-info',
      {
        params: {
          version: '0.0.1',
        },
      }
    );
  });

  it('should handle no update available', async () => {
    const mockUpdateInfo = {
      CurrentVersion: '0.0.1',
      MinimumVersion: '0.0.1',
      UpdateType: 'None' as const,
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockUpdateInfo });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateInfo(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.UpdateType).toBe('None');
  });

  it('should handle mandatory update', async () => {
    const mockUpdateInfo = {
      CurrentVersion: '2.0.0',
      MinimumVersion: '2.0.0',
      UpdateType: 'Required' as const,
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockUpdateInfo });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateInfo(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.UpdateType).toBe('Required');
  });

  it('should handle API error', async () => {
    // Reject twice because retry: 1 is configured
    mockAxios.get.mockRejectedValue(new Error('Network error'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateInfo(), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toBeDefined();
  });
});
