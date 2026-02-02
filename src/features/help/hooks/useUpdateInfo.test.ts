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

import { useUpdateInfo } from './useUpdateInfo';
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

describe('useUpdateInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch update info with version parameter', async () => {
    const mockUpdateInfo = {
      Version: '1.0.0',
      MandatoryUpdate: false,
      UpdateAvailable: true,
      Message: 'A new version is available',
      DownloadUrl: 'https://example.com/download',
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
      Version: '0.0.1',
      MandatoryUpdate: false,
      UpdateAvailable: false,
      Message: null,
      DownloadUrl: null,
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockUpdateInfo });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateInfo(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.UpdateAvailable).toBe(false);
  });

  it('should handle mandatory update', async () => {
    const mockUpdateInfo = {
      Version: '2.0.0',
      MandatoryUpdate: true,
      UpdateAvailable: true,
      Message: 'Critical security update required',
      DownloadUrl: 'https://example.com/critical-download',
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockUpdateInfo });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateInfo(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.MandatoryUpdate).toBe(true);
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
