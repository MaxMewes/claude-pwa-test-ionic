import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, subDays } from 'date-fns';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, ResultCounter, ResultFilter } from '../../../api/types';
import { ResultPeriodFilter } from '../../../shared/store/useSettingsStore';

const RESULTS_KEY = 'results';
// Different page sizes for different loading scenarios
const INITIAL_PAGE_SIZE = 25;      // First load
const PREFETCH_PAGE_SIZE = 25;     // Second automatic load
const SCROLL_PAGE_SIZE = 50;       // Scroll-triggered loads

// Get items per page based on page number
function getItemsPerPage(pageNumber: number): number {
  if (pageNumber === 1) return INITIAL_PAGE_SIZE;
  if (pageNumber === 2) return PREFETCH_PAGE_SIZE;
  return SCROLL_PAGE_SIZE;
}

// V3 API query parameters (camelCase as expected by API)
interface ApiQueryParams {
  startDate?: string;
  endDate?: string;
  query?: string;
  resultCategory?: 'None' | 'Favorites' | 'New' | 'Pathological' | 'Urgent' | 'HighPathological';
  resultTypes?: string;
  patientIds?: number[];
  senderIds?: number[];
  area?: 'NotArchived' | 'Archived' | 'All';
  currentPage?: number;
  itemsPerPage?: number;
  sortColumn?: 'None' | 'ReportDate' | 'LabNo' | 'Patient' | 'KisVisitNumber';
  sortDirection?: 'None' | 'Descending' | 'Ascending';
}

// V3 API response format
interface ResultsResponseV3 {
  Results: LabResult[];
  TotalCount: number;
  CurrentPage: number;
  ItemsPerPage: number;
  TotalPages: number;
}

// Map period filter to API date parameters (camelCase)
function mapPeriodToDateParams(period: ResultPeriodFilter): { startDate?: string; endDate?: string; area?: ApiQueryParams['area'] } {
  const now = new Date();
  const todayStart = startOfDay(now);
  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  switch (period) {
    case 'today':
      return {
        startDate: formatDate(todayStart),
        endDate: formatDate(now),
        area: 'NotArchived',
      };
    case '7days':
      return {
        startDate: formatDate(subDays(todayStart, 7)),
        endDate: formatDate(now),
        area: 'NotArchived',
      };
    case '30days':
      return {
        startDate: formatDate(subDays(todayStart, 30)),
        endDate: formatDate(now),
        area: 'NotArchived',
      };
    case 'archive':
      return {
        area: 'Archived',
      };
    case 'all':
    default:
      return {
        area: 'NotArchived',
      };
  }
}

// Map local filters to V3 API format (camelCase)
function mapFiltersToV3(filters?: ResultFilter, page = 1, itemsPerPage?: number, period?: ResultPeriodFilter): ApiQueryParams {
  const v3Filters: ApiQueryParams = {
    itemsPerPage: itemsPerPage ?? getItemsPerPage(page),
    sortColumn: 'ReportDate',
    sortDirection: 'Descending',
    // API uses 0-based pagination
    currentPage: page - 1,
  };

  // Apply period filter first (sets startDate, endDate, area)
  if (period) {
    const periodParams = mapPeriodToDateParams(period);
    Object.assign(v3Filters, periodParams);
  }

  if (!filters) return v3Filters;

  // Status/area filter - only override if not already set by period
  if (filters.isArchived) {
    v3Filters.area = 'Archived';
  } else if (!v3Filters.area) {
    v3Filters.area = 'NotArchived';
  }

  // Favorites filter (from filter modal)
  if (filters.isPinned || filters.isFavorite) {
    v3Filters.resultCategory = 'Favorites';
  }
  // Category filter (maps UI category to API resultCategory)
  else if (filters.area === 'new') {
    v3Filters.resultCategory = 'New';
  } else if (filters.area === 'pathological') {
    v3Filters.resultCategory = 'Pathological';
  } else if (filters.area === 'highPathological') {
    v3Filters.resultCategory = 'HighPathological';
  } else if (filters.area === 'urgent') {
    v3Filters.resultCategory = 'Urgent';
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
      v3Filters.resultTypes = mappedTypes.join(',');
    }
  }

  // Date filter - only override if not set by period filter
  if (filters.dateFrom && !v3Filters.startDate) {
    v3Filters.startDate = filters.dateFrom;
  }
  if (filters.dateTo && !v3Filters.endDate) {
    v3Filters.endDate = filters.dateTo;
  }

  // Search query
  if (filters.search) {
    v3Filters.query = filters.search;
  }

  // Patient filter
  if (filters.patientIds?.length) {
    v3Filters.patientIds = filters.patientIds.map(id => Number(id));
  }

  // Sender filter
  if (filters.senderIds?.length) {
    v3Filters.senderIds = filters.senderIds.map(id => Number(id));
  }

  // Sort
  if (filters.sortColumn) {
    v3Filters.sortColumn = filters.sortColumn as ApiQueryParams['sortColumn'];
  }
  if (filters.sortDirection) {
    v3Filters.sortDirection = filters.sortDirection === 'asc' ? 'Ascending' : 'Descending';
  }

  return v3Filters;
}

export function useResults(filter?: ResultFilter, period?: ResultPeriodFilter) {
  return useInfiniteQuery({
    queryKey: [RESULTS_KEY, filter, period],
    queryFn: async ({ pageParam = 1 }) => {
      // Build query params with dynamic page size
      const currentPageSize = getItemsPerPage(pageParam);
      const params = mapFiltersToV3(filter, pageParam, currentPageSize, period);

      // Fetch results - use TotalCount from results endpoint (reflects filtered count)
      const resultsResponse = await axiosInstance.get<ResultsResponseV3>('/api/v3/results', { params });
      const results = resultsResponse.data.Results || [];
      // Use TotalCount from results endpoint - this reflects the filtered category count
      const totalCount = resultsResponse.data.TotalCount || results.length;

      return {
        Results: results,
        TotalCount: totalCount,
        CurrentPage: pageParam - 1, // API uses 0-based
        ItemsPerPage: currentPageSize,
        TotalPages: Math.ceil(totalCount / SCROLL_PAGE_SIZE), // Use scroll size for estimation
        pageNumber: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate total items loaded across all pages
      const totalLoaded = allPages.reduce((sum, page) => sum + page.Results.length, 0);

      // No more pages if:
      // 1. We've loaded all items based on TotalCount
      // 2. OR the last page returned fewer items than requested (incomplete page = end of data)
      const lastPageWasIncomplete = lastPage.Results.length < lastPage.ItemsPerPage;

      if (totalLoaded >= lastPage.TotalCount || lastPageWasIncomplete) {
        return undefined;
      }
      return lastPage.pageNumber + 1;
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
      // Counter endpoint uses startDateTime/endDateTime (not startDate/endDate)
      const params: Record<string, string> = {};
      if (period) {
        const periodParams = mapPeriodToDateParams(period);
        if (periodParams.startDate) params.startDateTime = periodParams.startDate;
        if (periodParams.endDate) params.endDateTime = periodParams.endDate;
        if (periodParams.area) params.area = periodParams.area;
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
