// vitest globals available via config
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { format, startOfDay, subDays } from 'date-fns';
import React from 'react';

// Use vi.hoisted to define mock functions that are hoisted with vi.mock
const { mockGet, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
}));

// Mock axios before importing the hook
vi.mock('../../../api/client/axiosInstance', () => ({
  axiosInstance: {
    get: mockGet,
    patch: mockPatch,
  },
}));

import {
  useResults,
  useResult,
  useResultCounter,
  useMarkResultAsRead,
  useMarkResultAsUnread,
  useMarkResultAsFavorite,
  useMarkResultAsNotFavorite,
  useMarkResultAsArchived,
  useMarkResultAsNotArchived,
  useToggleResultPin,
} from './useResults';

const mockAxios = { get: mockGet, patch: mockPatch };

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('period filtering', () => {
    it('should call API with today date filter for today period', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults(undefined, 'today'), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[0]).toBe('/api/v3/results');
      expect(callArgs[1]?.params).toMatchObject({
        Area: 'NotArchived',
      });
      // Verify StartDate is today
      const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
      expect(callArgs[1]?.params.StartDate).toBe(today);
    });

    it('should call API with 7 days date filter for 7days period', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults(undefined, '7days'), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      const sevenDaysAgo = format(subDays(startOfDay(new Date()), 7), 'yyyy-MM-dd');
      expect(callArgs[1]?.params.StartDate).toBe(sevenDaysAgo);
      expect(callArgs[1]?.params.Area).toBe('NotArchived');
    });

    it('should call API with 30 days date filter for 30days period', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults(undefined, '30days'), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      const thirtyDaysAgo = format(subDays(startOfDay(new Date()), 30), 'yyyy-MM-dd');
      expect(callArgs[1]?.params.StartDate).toBe(thirtyDaysAgo);
      expect(callArgs[1]?.params.Area).toBe('NotArchived');
    });

    it('should call API with Archive area for archive period', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults(undefined, 'archive'), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[1]?.params.Area).toBe('Archived');
      expect(callArgs[1]?.params.StartDate).toBeUndefined();
    });

    it('should call API with NotArchived area for all period', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults(undefined, 'all'), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[1]?.params.Area).toBe('NotArchived');
      expect(callArgs[1]?.params.StartDate).toBeUndefined();
    });
  });

  describe('filter parameters', () => {
    it('should pass search query to API', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults({ search: 'test search' }), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[1]?.params.Query).toBe('test search');
    });

    it('should pass patient IDs to API', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults({ patientIds: ['1', '2', '3'] }), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[1]?.params.PatientIds).toEqual([1, 2, 3]);
    });

    it('should pass category filter to API', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults({ area: 'pathological' }), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[1]?.params.ResultCategory).toBe('Pathological');
    });
  });

  describe('response handling', () => {
    it('should return results from API response', async () => {
      const mockResults = [
        { Id: 1, LabNo: 'LAB001', Patient: { Id: 1, Firstname: 'John', Lastname: 'Doe' } },
        { Id: 2, LabNo: 'LAB002', Patient: { Id: 2, Firstname: 'Jane', Lastname: 'Smith' } },
      ];
      const mockResponse = {
        data: {
          Results: mockResults,
          TotalCount: 2,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResults(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data?.pages[0].Results).toEqual(mockResults);
      expect(result.current.data?.pages[0].TotalCount).toBe(2);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 0,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResults(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data?.pages[0].Results).toEqual([]);
      expect(result.current.data?.pages[0].TotalCount).toBe(0);
    });
  });

  describe('sorting', () => {
    it('should default to ReportDate descending sort', async () => {
      const mockResponse = {
        data: {
          Results: [],
          TotalCount: 0,
          CurrentPage: 0,
          ItemsPerPage: 25,
          TotalPages: 1,
        },
      };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const wrapper = createWrapper();
      renderHook(() => useResults(), { wrapper });

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalled();
      });

      const callArgs = mockAxios.get.mock.calls[0];
      expect(callArgs[1]?.params.SortColumn).toBe('ReportDate');
      expect(callArgs[1]?.params.SortDirection).toBe('Descending');
    });
  });
});

describe('useResultCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and transform counter data', async () => {
    const mockResponse = {
      data: {
        TotalCount: 100,
        NonReadCount: 10,
        PathologicalCount: 5,
        HighPathologicalCount: 2,
        UrgentCount: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResultCounter(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual({
      Total: 100,
      New: 10,
      Pathological: 5,
      HighPathological: 2,
      Urgent: 1,
    });
  });

  it('should handle missing counter values', async () => {
    const mockResponse = {
      data: {},
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResultCounter(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual({
      Total: 0,
      New: 0,
      Pathological: 0,
      HighPathological: 0,
      Urgent: 0,
    });
  });
});

describe('additional filter branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass isArchived filter to API', async () => {
    const mockResponse = {
      data: {
        Results: [],
        TotalCount: 0,
        CurrentPage: 0,
        ItemsPerPage: 25,
        TotalPages: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    renderHook(() => useResults({ isArchived: true }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    const callArgs = mockAxios.get.mock.calls[0];
    expect(callArgs[1]?.params.Area).toBe('Archived');
  });

  it('should pass new category filter to API', async () => {
    const mockResponse = {
      data: {
        Results: [],
        TotalCount: 0,
        CurrentPage: 0,
        ItemsPerPage: 25,
        TotalPages: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    renderHook(() => useResults({ area: 'new' }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    const callArgs = mockAxios.get.mock.calls[0];
    expect(callArgs[1]?.params.ResultCategory).toBe('New');
  });

  it('should pass urgent category filter to API', async () => {
    const mockResponse = {
      data: {
        Results: [],
        TotalCount: 0,
        CurrentPage: 0,
        ItemsPerPage: 25,
        TotalPages: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    renderHook(() => useResults({ area: 'urgent' }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    const callArgs = mockAxios.get.mock.calls[0];
    expect(callArgs[1]?.params.ResultCategory).toBe('Urgent');
  });

  it('should pass date filters when no period is set', async () => {
    const mockResponse = {
      data: {
        Results: [],
        TotalCount: 0,
        CurrentPage: 0,
        ItemsPerPage: 25,
        TotalPages: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    renderHook(() => useResults({ dateFrom: '2024-01-01', dateTo: '2024-01-31' }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    const callArgs = mockAxios.get.mock.calls[0];
    expect(callArgs[1]?.params.StartDate).toBe('2024-01-01');
    expect(callArgs[1]?.params.EndDate).toBe('2024-01-31');
  });

  it('should pass sender IDs to API', async () => {
    const mockResponse = {
      data: {
        Results: [],
        TotalCount: 0,
        CurrentPage: 0,
        ItemsPerPage: 25,
        TotalPages: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    renderHook(() => useResults({ senderIds: ['10', '20'] }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    const callArgs = mockAxios.get.mock.calls[0];
    expect(callArgs[1]?.params.SenderIds).toEqual([10, 20]);
  });

  it('should pass sort column and direction to API', async () => {
    const mockResponse = {
      data: {
        Results: [],
        TotalCount: 0,
        CurrentPage: 0,
        ItemsPerPage: 25,
        TotalPages: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    renderHook(() => useResults({ sortColumn: 'LabNo', sortDirection: 'asc' }), { wrapper });

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });

    const callArgs = mockAxios.get.mock.calls[0];
    expect(callArgs[1]?.params.SortColumn).toBe('LabNo');
    expect(callArgs[1]?.params.SortDirection).toBe('Ascending');
  });
});

describe('useResult (single result)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single result by ID', async () => {
    const mockResponse = {
      data: {
        Result: {
          Id: 123,
          LabNo: 'LAB123',
          ReportDate: '2024-01-15',
          IsFavorite: true,
          IsArchived: false,
          Patient: {
            Id: 1,
            Firstname: 'John',
            Lastname: 'Doe',
            DateOfBirth: '1990-01-01',
          },
          ResultData: {},
        },
        Sender: { Id: 1, Fullname: 'Dr. Smith' },
        LaboratoryName: 'Test Lab',
        LaboratoryId: 1,
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResult(123), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockAxios.get).toHaveBeenCalledWith('/api/v3/results/123');
    expect(result.current.data?.Id).toBe(123);
    expect(result.current.data?.LabNo).toBe('LAB123');
    expect(result.current.data?.Patient.Firstname).toBe('John');
  });

  it('should not fetch when ID is undefined', async () => {
    const wrapper = createWrapper();
    renderHook(() => useResult(undefined), { wrapper });

    // Wait a bit to ensure no call was made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should transform result data correctly', async () => {
    const mockResponse = {
      data: {
        Result: {
          Id: 123,
          LabNo: 'LAB123',
          ReportDate: '2024-01-15',
          IsFavorite: false,
          IsArchived: false,
          Patient: {
            Id: 1,
            Firstname: 'John',
            Lastname: 'Doe',
            DateOfBirth: '1990-01-01',
          },
          ResultData: {
            'Blood Tests': [
              {
                Id: 1,
                TestIdent: 'HGB',
                TestName: 'Hemoglobin',
                Value: 14.5,
                ValueText: '14.5',
                Unit: 'g/dL',
                NormalLow: 12,
                NormalHigh: 16,
                PathoFlag: null,
              },
              {
                Id: 2,
                TestIdent: 'WBC',
                TestName: 'White Blood Cells',
                Value: 11.5,
                ValueText: '11.5',
                Unit: 'K/uL',
                NormalLow: 4,
                NormalHigh: 10,
                PathoFlag: 'High',
              },
            ],
          },
        },
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResult(123), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.ResultData).toHaveLength(2);
    expect(result.current.data?.ResultData?.[0].TestName).toBe('Hemoglobin');
    expect(result.current.data?.ResultData?.[1].IsPathological).toBe(true);
    expect(result.current.data?.ResultData?.[1].PathologyIndicator).toBe('H');
  });

  it('should transform VeryLow PathoFlag correctly', async () => {
    const mockResponse = {
      data: {
        Result: {
          Id: 123,
          LabNo: 'LAB123',
          ReportDate: '2024-01-15',
          IsFavorite: false,
          IsArchived: false,
          Patient: {
            Id: 1,
            Firstname: 'John',
            Lastname: 'Doe',
            DateOfBirth: '1990-01-01',
          },
          ResultData: {
            Tests: [
              {
                Id: 1,
                TestIdent: 'HGB',
                TestName: 'Hemoglobin',
                Value: 8,
                ValueText: '8',
                Unit: 'g/dL',
                NormalLow: 12,
                NormalHigh: 16,
                PathoFlag: 'VeryLow',
              },
            ],
          },
        },
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResult(123), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.ResultData?.[0].PathologyIndicator).toBe('LL');
  });

  it('should transform VeryHigh PathoFlag correctly', async () => {
    const mockResponse = {
      data: {
        Result: {
          Id: 123,
          LabNo: 'LAB123',
          ReportDate: '2024-01-15',
          IsFavorite: false,
          IsArchived: false,
          Patient: {
            Id: 1,
            Firstname: 'John',
            Lastname: 'Doe',
            DateOfBirth: '1990-01-01',
          },
          ResultData: {
            Tests: [
              {
                Id: 1,
                TestIdent: 'GLU',
                TestName: 'Glucose',
                Value: 300,
                ValueText: '300',
                Unit: 'mg/dL',
                NormalLow: 70,
                NormalHigh: 100,
                PathoFlag: 'VeryHigh',
              },
            ],
          },
        },
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResult(123), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.ResultData?.[0].PathologyIndicator).toBe('HH');
  });

  it('should transform Low PathoFlag correctly', async () => {
    const mockResponse = {
      data: {
        Result: {
          Id: 123,
          LabNo: 'LAB123',
          ReportDate: '2024-01-15',
          IsFavorite: false,
          IsArchived: false,
          Patient: {
            Id: 1,
            Firstname: 'John',
            Lastname: 'Doe',
            DateOfBirth: '1990-01-01',
          },
          ResultData: {
            Tests: [
              {
                Id: 1,
                TestIdent: 'HGB',
                TestName: 'Hemoglobin',
                Value: 11,
                ValueText: '11',
                Unit: 'g/dL',
                NormalLow: 12,
                NormalHigh: 16,
                PathoFlag: 'Low',
              },
            ],
          },
        },
      },
    };
    mockAxios.get.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useResult(123), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.ResultData?.[0].PathologyIndicator).toBe('L');
  });
});

describe('mutation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useMarkResultAsRead should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkResultAsRead(), { wrapper });

    await result.current.mutateAsync([1, 2, 3]);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/mark-as-read', [1, 2, 3]);
  });

  it('useMarkResultAsUnread should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkResultAsUnread(), { wrapper });

    await result.current.mutateAsync([1, 2]);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/mark-as-unread', [1, 2]);
  });

  it('useMarkResultAsFavorite should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkResultAsFavorite(), { wrapper });

    await result.current.mutateAsync([5]);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/mark-as-favorite', [5]);
  });

  it('useMarkResultAsNotFavorite should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkResultAsNotFavorite(), { wrapper });

    await result.current.mutateAsync([5]);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/mark-as-not-favorite', [5]);
  });

  it('useMarkResultAsArchived should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkResultAsArchived(), { wrapper });

    await result.current.mutateAsync([10, 11]);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/mark-as-archived', [10, 11]);
  });

  it('useMarkResultAsNotArchived should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkResultAsNotArchived(), { wrapper });

    await result.current.mutateAsync([10]);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/mark-as-not-archived', [10]);
  });

  it('useToggleResultPin should call the correct API', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleResultPin(), { wrapper });

    await result.current.mutateAsync(123);

    expect(mockAxios.patch).toHaveBeenCalledWith('/api/v3/results/123/pin');
  });
});
