import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, ResultCounter, ResultFilter } from '../../../api/types';
import { ResultPeriodFilter } from '../../../shared/store/useSettingsStore';
import { RESULTS_ENDPOINTS } from '../../../api/endpoints';
import { resultsKeys } from '../../../api/queryKeys';
import { mapFiltersToV3 } from '../../../api/mappers/results';

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

// V3 API response format
interface ResultsResponseV3 {
  Results: LabResult[];
  TotalCount: number;
  CurrentPage: number;
  ItemsPerPage: number;
  TotalPages: number;
}


export function useResults(filter?: ResultFilter, period?: ResultPeriodFilter) {
  return useInfiniteQuery({
    queryKey: resultsKeys.list(filter, period),
    queryFn: async ({ pageParam = 1 }) => {
      // Build query params with dynamic page size
      const currentPageSize = getItemsPerPage(pageParam);
      const params = mapFiltersToV3(filter, pageParam, currentPageSize, period);

      // Fetch results - use TotalCount from results endpoint (reflects filtered count)
      const resultsResponse = await axiosInstance.get<ResultsResponseV3>(RESULTS_ENDPOINTS.LIST, { params });
      const results = resultsResponse.data.Results || [];
      // API may not return TotalCount - use undefined to signal we don't know the total
      const totalCount = resultsResponse.data.TotalCount;

      return {
        Results: results,
        TotalCount: totalCount, // May be undefined if API doesn't provide it
        CurrentPage: pageParam - 1, // API uses 0-based
        ItemsPerPage: currentPageSize,
        TotalPages: totalCount ? Math.ceil(totalCount / SCROLL_PAGE_SIZE) : undefined,
        pageNumber: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate total items loaded across all pages
      const totalLoaded = allPages.reduce((sum, page) => sum + page.Results.length, 0);

      // Last page is incomplete if it returned fewer items than requested
      const lastPageWasIncomplete = lastPage.Results.length < lastPage.ItemsPerPage;

      // Determine if there are more pages:
      // - If API provides TotalCount: use it to check if we've loaded everything
      // - If API doesn't provide TotalCount: assume more pages exist unless last page was incomplete
      let hasMore: boolean;
      if (lastPage.TotalCount !== undefined) {
        // API provided total count - use it
        hasMore = totalLoaded < lastPage.TotalCount && !lastPageWasIncomplete;
      } else {
        // API didn't provide total count - assume more pages if last page was full
        hasMore = !lastPageWasIncomplete;
      }

      if (!hasMore) {
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
    queryKey: resultsKeys.detail(id as number),
    queryFn: async () => {
      // labGate API v3 endpoint returns nested structure
      const response = await axiosInstance.get<ResultDetailResponse>(RESULTS_ENDPOINTS.DETAIL(id as number));
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
    queryKey: resultsKeys.counters(period),
    queryFn: async () => {
      // Build params with period filter to match the results query
      // Counter endpoint uses startDateTime/endDateTime (not startDate/endDate)
      const params: Record<string, string> = {};
      if (period) {
        const { mapPeriodToDateParams } = await import('../../../api/mappers/dates');
        const periodParams = mapPeriodToDateParams(period);
        if (periodParams.startDate) params.startDateTime = periodParams.startDate;
        if (periodParams.endDate) params.endDateTime = periodParams.endDate;
        if (periodParams.area) params.area = periodParams.area;
      }

      const response = await axiosInstance.get<CounterResponseV3>(RESULTS_ENDPOINTS.COUNTER, { params });
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
      const response = await axiosInstance.patch(`${RESULTS_ENDPOINTS.LIST}/mark-as-read`, resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
    },
  });
}

export function useMarkResultAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`${RESULTS_ENDPOINTS.LIST}/mark-as-unread`, resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
    },
  });
}

export function useMarkResultAsFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`${RESULTS_ENDPOINTS.LIST}/mark-as-favorite`, resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
    },
  });
}

export function useMarkResultAsNotFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`${RESULTS_ENDPOINTS.LIST}/mark-as-not-favorite`, resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
    },
  });
}

export function useMarkResultAsArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`${RESULTS_ENDPOINTS.LIST}/mark-as-archived`, resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
    },
  });
}

export function useMarkResultAsNotArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`${RESULTS_ENDPOINTS.LIST}/mark-as-not-archived`, resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
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
      queryClient.invalidateQueries({ queryKey: resultsKeys.all });
    },
  });
}
