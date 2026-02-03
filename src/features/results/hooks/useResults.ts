import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, subDays } from 'date-fns';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, ResultCounter, ResultFilter } from '../../../api/types';
import { ResultPeriodFilter } from '../../../shared/store/useSettingsStore';

const RESULTS_KEY = 'results';
const ITEMS_PER_PAGE = 25;

// V3 API query parameters (PascalCase as expected by API)
interface ApiQueryParams {
  StartDate?: string;
  EndDate?: string;
  Query?: string;
  ResultCategory?: 'None' | 'Favorites' | 'New' | 'Pathological' | 'Urgent' | 'HighPathological';
  ResultType?: string;
  PatientIds?: number[];
  SenderIds?: number[];
  Area?: 'NotArchived' | 'Archived' | 'All';
  CurrentPage?: number;
  ItemsPerPage?: number;
  SortColumn?: 'None' | 'ReportDate' | 'LabNo' | 'Patient' | 'KisVisitNumber';
  SortDirection?: 'None' | 'Descending' | 'Ascending';
}

// V3 API response format
interface ResultsResponseV3 {
  Results: LabResult[];
  TotalCount: number;
  CurrentPage: number;
  ItemsPerPage: number;
  TotalPages: number;
}

// Map period filter to API date parameters
function mapPeriodToDateParams(period: ResultPeriodFilter): { StartDate?: string; EndDate?: string; Area?: ApiQueryParams['Area'] } {
  const now = new Date();
  const todayStart = startOfDay(now);
  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  switch (period) {
    case 'today':
      return {
        StartDate: formatDate(todayStart),
        EndDate: formatDate(now),
        Area: 'NotArchived',
      };
    case '7days':
      return {
        StartDate: formatDate(subDays(todayStart, 7)),
        EndDate: formatDate(now),
        Area: 'NotArchived',
      };
    case '30days':
      return {
        StartDate: formatDate(subDays(todayStart, 30)),
        EndDate: formatDate(now),
        Area: 'NotArchived',
      };
    case 'archive':
      return {
        Area: 'Archived',
      };
    case 'all':
    default:
      return {
        Area: 'NotArchived',
      };
  }
}

// Map local filters to V3 API format
function mapFiltersToV3(filters?: ResultFilter, page = 1, itemsPerPage = ITEMS_PER_PAGE, period?: ResultPeriodFilter): ApiQueryParams {
  const v3Filters: ApiQueryParams = {
    ItemsPerPage: itemsPerPage,
    SortColumn: 'ReportDate',
    SortDirection: 'Descending',
    // API uses 0-based pagination
    CurrentPage: page - 1,
  };

  // Apply period filter first (sets StartDate, EndDate, Area)
  if (period) {
    const periodParams = mapPeriodToDateParams(period);
    Object.assign(v3Filters, periodParams);
  }

  if (!filters) return v3Filters;

  // Status/Area filter - only override if not already set by period
  if (filters.isArchived) {
    v3Filters.Area = 'Archived';
  } else if (!v3Filters.Area) {
    v3Filters.Area = 'NotArchived';
  }

  // Favorites filter (from filter modal)
  if (filters.isPinned || filters.isFavorite) {
    v3Filters.ResultCategory = 'Favorites';
  }
  // Category filter
  else if (filters.area === 'new') {
    v3Filters.ResultCategory = 'New';
  } else if (filters.area === 'pathological') {
    v3Filters.ResultCategory = 'Pathological';
  } else if (filters.area === 'urgent') {
    v3Filters.ResultCategory = 'Urgent';
  }

  // Result type filter (E=Endbefund, T=Teilbefund, V=Vorläufig, N=Nachforderung, A=Archiv)
  if (filters.resultTypes?.length) {
    const typeMap: Record<string, string> = {
      final: 'E',
      partial: 'T',
      preliminary: 'V',
      followUp: 'N',
      archive: 'A',
    };
    const mappedTypes = filters.resultTypes.map(t => typeMap[t]).filter(Boolean);
    if (mappedTypes.length) {
      v3Filters.ResultType = mappedTypes.join(',');
    }
  }

  // Date filter - only override if not set by period filter
  if (filters.dateFrom && !v3Filters.StartDate) {
    v3Filters.StartDate = filters.dateFrom;
  }
  if (filters.dateTo && !v3Filters.EndDate) {
    v3Filters.EndDate = filters.dateTo;
  }

  // Search query
  if (filters.search) {
    v3Filters.Query = filters.search;
  }

  // Patient filter
  if (filters.patientIds?.length) {
    v3Filters.PatientIds = filters.patientIds.map(id => Number(id));
  }

  // Sender filter
  if (filters.senderIds?.length) {
    v3Filters.SenderIds = filters.senderIds.map(id => Number(id));
  }

  // Sort
  if (filters.sortColumn) {
    v3Filters.SortColumn = filters.sortColumn as ApiQueryParams['SortColumn'];
  }
  if (filters.sortDirection) {
    v3Filters.SortDirection = filters.sortDirection === 'asc' ? 'Ascending' : 'Descending';
  }

  return v3Filters;
}

// Counter response type
interface CounterResponse {
  TotalCount?: number;
  NonReadCount?: number;
  PathologicalCount?: number;
  HighPathologicalCount?: number;
  UrgentCount?: number;
  FavoriteCount?: number;
}

export function useResults(filter?: ResultFilter, period?: ResultPeriodFilter) {
  return useInfiniteQuery({
    queryKey: [RESULTS_KEY, filter, period],
    queryFn: async ({ pageParam = 1 }) => {
      // Build query params
      const params = mapFiltersToV3(filter, pageParam, ITEMS_PER_PAGE, period);

      // Build counter params (same period filter)
      const counterParams: Record<string, string> = {};
      if (period) {
        const periodParams = mapPeriodToDateParams(period);
        if (periodParams.StartDate) counterParams.StartDate = periodParams.StartDate;
        if (periodParams.EndDate) counterParams.EndDate = periodParams.EndDate;
        if (periodParams.Area) counterParams.Area = periodParams.Area;
      }

      // Fetch results first (required), then try counter (optional for total count)
      const resultsResponse = await axiosInstance.get<ResultsResponseV3>('/api/v3/results', { params });
      const results = resultsResponse.data.Results || [];

      // Try to get counter for accurate total, but don't fail if it errors
      let totalCount = results.length;
      try {
        const counterResponse = await axiosInstance.get<CounterResponse>('/api/v3/results/counter', { params: counterParams });
        totalCount = counterResponse.data?.TotalCount ?? results.length;
      } catch {
        // Counter failed - estimate: if we got a full page, assume there are more
        totalCount = results.length === ITEMS_PER_PAGE ? results.length + 1 : results.length;
      }

      return {
        Results: results,
        TotalCount: totalCount,
        CurrentPage: pageParam - 1, // API uses 0-based
        ItemsPerPage: ITEMS_PER_PAGE,
        TotalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        pageNumber: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate total items loaded across all pages
      const totalLoaded = allPages.reduce((sum, page) => sum + page.Results.length, 0);
      // If we've loaded fewer than total, there are more pages
      if (totalLoaded < lastPage.TotalCount) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
  });
}

// V3 detail response test data item
interface ResultDataItemV3 {
  Id: number;
  TestIdent: string;
  TestName: string;
  Value: number | null;
  ValueText: string | null;
  Unit: string | null;
  NormalLow: number | null;
  NormalHigh: number | null;
  NormalText: string | null;
  PathoFlag: 'VeryLow' | 'Low' | 'Unknown' | 'High' | 'VeryHigh' | null;
}

// V3 detail response structure
interface ResultDetailResponse {
  Result: {
    Id: number;
    Ident?: string;
    LabNo: string;
    Notes?: string;
    ReportDate: string;
    OrderDate?: string;
    IsFavorite: boolean;
    IsArchived: boolean;
    IsPatho?: boolean;
    SenderReference?: string;
    Patient: {
      Id: number;
      Firstname: string;
      Lastname: string;
      DateOfBirth: string;
    };
    ResultData?: Record<string, ResultDataItemV3[]>;
    ValidatedByName?: string;
  };
  Sender?: { Id: number; Fullname: string };
  LaboratoryName?: string;
  LaboratoryId?: number;
}

export function useResult(id: string | number | undefined) {
  return useQuery({
    queryKey: [RESULTS_KEY, id],
    queryFn: async () => {
      // labGate API v3 endpoint returns nested structure
      const response = await axiosInstance.get<ResultDetailResponse>(`/api/v3/results/${id}`);
      const data = response.data;
      const apiResult = data.Result;

      // Flatten ResultData from Record<string, item[]> to flat array
      const flattenedTests: import('../../../api/types').TestResult[] = [];
      if (apiResult.ResultData) {
        for (const sectionTests of Object.values(apiResult.ResultData)) {
          for (const item of sectionTests) {
            flattenedTests.push({
              Id: item.Id,
              TestIdent: item.TestIdent,
              TestName: item.TestName,
              Value: item.ValueText || String(item.Value ?? ''),
              Unit: item.Unit || undefined,
              ReferenceRange: item.NormalText || undefined,
              ReferenceMin: item.NormalLow ?? undefined,
              ReferenceMax: item.NormalHigh ?? undefined,
              IsPathological: item.PathoFlag != null && item.PathoFlag !== 'Unknown',
              PathologyIndicator: item.PathoFlag === 'VeryLow' ? 'LL' :
                                  item.PathoFlag === 'Low' ? 'L' :
                                  item.PathoFlag === 'High' ? 'H' :
                                  item.PathoFlag === 'VeryHigh' ? 'HH' : undefined,
            });
          }
        }
      }

      // Flatten the nested response into LabResult format
      const result: LabResult = {
        Id: apiResult.Id,
        LabNo: apiResult.LabNo,
        ReportDate: apiResult.ReportDate,
        OrderDate: apiResult.OrderDate,
        IsFavorite: apiResult.IsFavorite,
        IsArchived: apiResult.IsArchived,
        IsRead: true, // Detail view means it's been read
        Patient: {
          Id: apiResult.Patient.Id,
          Firstname: apiResult.Patient.Firstname,
          Lastname: apiResult.Patient.Lastname,
          DateOfBirth: apiResult.Patient.DateOfBirth,
        },
        Sender: data.Sender ? { Id: data.Sender.Id, Name: data.Sender.Fullname } : undefined,
        Laboratory: data.LaboratoryName ? { Id: data.LaboratoryId || 0, Name: data.LaboratoryName } : undefined,
        ResultData: flattenedTests,
      };

      return result;
    },
    enabled: !!id,
  });
}

// Counter response from V3 API
interface CounterResponseV3 {
  TotalCount?: number;
  NonReadCount?: number;
  PathologicalCount?: number;
  HighPathologicalCount?: number;
  UrgentCount?: number;
  FavoriteCount?: number;
}

export function useResultCounter(period?: ResultPeriodFilter) {
  return useQuery({
    queryKey: [RESULTS_KEY, 'counter', period],
    queryFn: async () => {
      // Build params with period filter to match the results query
      const params: Record<string, string> = {};
      if (period) {
        const periodParams = mapPeriodToDateParams(period);
        if (periodParams.StartDate) params.StartDate = periodParams.StartDate;
        if (periodParams.EndDate) params.EndDate = periodParams.EndDate;
        if (periodParams.Area) params.Area = periodParams.Area;
      }

      const response = await axiosInstance.get<CounterResponseV3>('/api/v3/results/counter', { params });
      const data = response.data;

      // Map to local format
      return {
        Total: data.TotalCount || 0,
        New: data.NonReadCount || 0,
        Pathological: data.PathologicalCount || 0,
        HighPathological: data.HighPathologicalCount || 0,
        Urgent: data.UrgentCount || 0,
      } as ResultCounter;
    },
    // Don't fail silently - allow fallback in component
    retry: 1,
    retryDelay: 1000,
  });
}

// Note: Trend data is now fetched via usePatientLabTrends hook which aggregates
// data from multiple results for a patient (client-side aggregation approach)

export function useMarkResultAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-read', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-unread', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-favorite', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsNotFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-not-favorite', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-archived', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsNotArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-not-archived', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useToggleResultPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultId: number) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`/api/v3/results/${resultId}/pin`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}
