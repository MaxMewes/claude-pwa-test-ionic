import { useState, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, ResultCounter, ResultFilter, ResultDocument } from '../../../api/types';
import { ResultPeriodFilter } from '../../../shared/store/useSettingsStore';
import { RESULTS_ENDPOINTS } from '../../../api/endpoints';
import { resultsKeys } from '../../../api/queryKeys';
import { mapFiltersToV3 } from '../../../api/mappers/results';

// Fixed page size for all requests to avoid pagination offset bugs
// (variable page sizes cause items to be skipped due to API offset calculation)
const PAGE_SIZE = 50;

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
      // Build query params with fixed page size
      const params = mapFiltersToV3(filter, pageParam, PAGE_SIZE, period);

      // Fetch results - use TotalCount from results endpoint (reflects filtered count)
      const resultsResponse = await axiosInstance.get<ResultsResponseV3>(RESULTS_ENDPOINTS.LIST, { params });
      const results = resultsResponse.data.Results || [];
      // API may not return TotalCount - use undefined to signal we don't know the total
      const totalCount = resultsResponse.data.TotalCount;

      return {
        Results: results,
        TotalCount: totalCount, // May be undefined if API doesn't provide it
        CurrentPage: pageParam - 1, // API uses 0-based
        ItemsPerPage: PAGE_SIZE,
        TotalPages: totalCount ? Math.ceil(totalCount / PAGE_SIZE) : undefined,
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
    HasDocuments?: boolean;
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
        HasDocuments: apiResult.HasDocuments,
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
      // Counter endpoint uses StartDateTime/EndDateTime (PascalCase for labGate API)
      const params: Record<string, string> = {};
      if (period) {
        const { mapPeriodToDateParams } = await import('../../../api/mappers/dates');
        const periodParams = mapPeriodToDateParams(period);
        if (periodParams.StartDate) params.StartDateTime = periodParams.StartDate;
        if (periodParams.EndDate) params.EndDateTime = periodParams.EndDate;
        if (periodParams.Area) params.Area = periodParams.Area;
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

// V3 Documents list response
interface DocumentsListResponse {
  Documents: ResultDocument[];
}

export function useResultDocuments(resultId: string | number | undefined) {
  return useQuery({
    queryKey: resultsKeys.documents(resultId as number),
    queryFn: async () => {
      const response = await axiosInstance.get<DocumentsListResponse>(
        RESULTS_ENDPOINTS.DOCUMENTS(resultId as number)
      );
      return response.data.Documents || [];
    },
    enabled: !!resultId,
  });
}

export function useDownloadDocument() {
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

  const downloadDocument = useCallback(async (
    resultId: number | string,
    documentId: number,
    fileName: string,
  ) => {
    setIsDownloading(documentId);
    try {
      const response = await axiosInstance.get(
        RESULTS_ENDPOINTS.DOCUMENT_DOWNLOAD(resultId, documentId),
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      window.URL.revokeObjectURL(url);
      link.remove();
    } finally {
      setIsDownloading(null);
    }
  }, []);

  return { downloadDocument, isDownloading };
}
