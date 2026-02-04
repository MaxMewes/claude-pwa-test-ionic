import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import { useLaboratories, useLaboratory, useServiceCatalog, useServiceDetail } from './useLaboratories';

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

describe('useLaboratories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch laboratories list', async () => {
    const mockLaboratories = [
      { Id: 1, Name: 'Lab One', Street: '123 Main St' },
      { Id: 2, Name: 'Lab Two', Street: '456 Oak Ave' },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: mockLaboratories,
        TotalItemsCount: 2,
        CurrentPage: 1,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLaboratories(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].Results).toEqual(mockLaboratories);
    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/v3/laboratories'));
  });

  it('should handle empty laboratories list', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: [],
        TotalItemsCount: 0,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLaboratories(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].Results).toEqual([]);
  });

  it('should calculate total pages from total count', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: [],
        TotalItemsCount: 75,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLaboratories(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    // 75 items / 25 per page = 3 pages
    expect(result.current.data?.pages[0].TotalPages).toBe(3);
  });

  it('should fallback to Items length when TotalItemsCount is missing', async () => {
    const mockLaboratories = [
      { Id: 1, Name: 'Lab One' },
      { Id: 2, Name: 'Lab Two' },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: mockLaboratories,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLaboratories(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.pages[0].TotalCount).toBe(2);
  });
});

describe('useLaboratory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single laboratory by ID', async () => {
    const mockLaboratory = {
      Id: 1,
      Name: 'Test Laboratory',
      Street: '123 Test St',
      City: 'Test City',
      ContactPersons: [
        { Id: 1, Firstname: 'John', Name: 'Doe' },
      ],
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockLaboratory });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLaboratory('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockLaboratory);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/laboratories/1');
  });

  it('should not fetch when ID is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => useLaboratory(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should include contact persons in response', async () => {
    const mockLaboratory = {
      Id: 1,
      Name: 'Test Lab',
      ContactPersons: [
        { Id: 1, Firstname: 'Jane', Name: 'Smith', Position: 'Manager' },
        { Id: 2, Firstname: 'Bob', Name: 'Johnson', Position: 'Technician' },
      ],
      Contact: {
        Phone: '+49 123 456789',
        Email: 'info@testlab.com',
      },
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockLaboratory });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useLaboratory('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.ContactPersons).toHaveLength(2);
    expect(result.current.data?.Contact?.Phone).toBe('+49 123 456789');
  });
});

describe('useServiceCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch service catalog for laboratory', async () => {
    const mockServices = [
      { Id: 1, Name: 'Blood Test', Ident: 'BT001' },
      { Id: 2, Name: 'Urine Analysis', Ident: 'UA001' },
    ];
    mockAxios.get.mockResolvedValueOnce({
      data: {
        Items: mockServices,
        TotalCount: 2,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useServiceCatalog('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockServices);
    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('/api/v3/requests?laboratoryId=1'));
  });

  it('should include search parameter when provided', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { Items: [], TotalCount: 0 },
    });

    const wrapper = createWrapper();
    renderHook(() => useServiceCatalog('1', 'blood'), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('searchString=blood'));
  });

  it('should not fetch when laboratoryId is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => useServiceCatalog(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should handle empty Items array', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { Items: null, TotalCount: 0 },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useServiceCatalog('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useServiceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch service detail by ID', async () => {
    const mockServiceDetail = {
      Name: 'Complete Blood Count',
      PrintName: 'CBC',
      InternalIdent: 'CBC001',
      ClinicalIndication: 'General health screening',
      Preanalytics: 'Fasting recommended',
      Tests: [
        { Ident: 'RBC', Name: 'Red Blood Cells' },
        { Ident: 'WBC', Name: 'White Blood Cells' },
      ],
      Materials: [
        { Name: 'EDTA Blood', RequiredQuantity: 5, Unit: 'ml' },
      ],
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockServiceDetail });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useServiceDetail(123), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockServiceDetail);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/requests/123?languageCode=de');
  });

  it('should not fetch when serviceId is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => useServiceDetail(undefined), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should include materials and tests in response', async () => {
    const mockServiceDetail = {
      Name: 'Liver Panel',
      Tests: [
        { Ident: 'ALT', Name: 'Alanine Aminotransferase' },
        { Ident: 'AST', Name: 'Aspartate Aminotransferase' },
      ],
      Materials: [
        { Name: 'Serum', RequiredQuantity: 3, Unit: 'ml', SubjectArea: 'Specialist' },
      ],
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockServiceDetail });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useServiceDetail(456), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.Tests).toHaveLength(2);
    expect(result.current.data?.Materials).toHaveLength(1);
  });
});
