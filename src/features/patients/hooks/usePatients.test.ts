import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock axios
vi.mock('../../../api/client/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

import { usePatients, usePatient, usePatientResults } from './usePatients';
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

describe('usePatients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch patients list', async () => {
    const mockPatients = [
      { Id: 1, Firstname: 'John', Lastname: 'Doe' },
      { Id: 2, Firstname: 'Jane', Lastname: 'Smith' },
    ];
    mockAxios.get.mockResolvedValueOnce({ data: { Items: mockPatients } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockPatients);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/patients', {
      params: expect.objectContaining({
        itemsPerPage: 1000,
        currentPage: 1,
        patientSortColumn: 'Lastname',
        patientSortDirection: 'Ascending',
      }),
    });
  });

  it('should pass search query as parameter', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: { Items: [] } });

    const wrapper = createWrapper();
    renderHook(() => usePatients({ search: 'John' }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/patients', {
      params: expect.objectContaining({
        patientSearchQuery: 'John',
      }),
    });
  });

  it('should handle Results field (legacy) in response', async () => {
    const mockPatients = [{ Id: 1, Firstname: 'John', Lastname: 'Doe' }];
    mockAxios.get.mockResolvedValueOnce({ data: { Results: mockPatients } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockPatients);
  });

  it('should return empty array when no data', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('usePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single patient by ID', async () => {
    const mockPatient = {
      Id: 1,
      Firstname: 'John',
      Lastname: 'Doe',
      DateOfBirth: '1990-01-01',
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockPatient });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatient(1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockPatient);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/patients/1');
  });

  it('should not fetch when ID is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => usePatient(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should accept string ID', async () => {
    const mockPatient = { Id: 1, Firstname: 'John', Lastname: 'Doe' };
    mockAxios.get.mockResolvedValueOnce({ data: mockPatient });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatient('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/patients/1');
  });
});

describe('usePatientResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch patient results', async () => {
    const mockResults = [
      { Id: 1, LabNo: 'LAB001' },
      { Id: 2, LabNo: 'LAB002' },
    ];
    mockAxios.get.mockResolvedValueOnce({ data: { Results: mockResults } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatientResults(1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockResults);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/patients/1/results');
  });

  it('should not fetch when patientId is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => usePatientResults(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should return empty array when no results', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: {} });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatientResults(1), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual([]);
  });
});
