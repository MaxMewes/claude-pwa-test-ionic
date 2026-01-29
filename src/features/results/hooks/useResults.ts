import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, ResultCounter, ResultFilter } from '../../../api/types';

const RESULTS_KEY = 'results';
const ITEMS_PER_PAGE = 50;

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

// Map local filters to V3 API format
function mapFiltersToV3(filters?: ResultFilter, page = 1, itemsPerPage = ITEMS_PER_PAGE): ApiQueryParams {
  const v3Filters: ApiQueryParams = {
    ItemsPerPage: itemsPerPage,
    SortColumn: 'ReportDate',
    SortDirection: 'Descending',
    // API uses 0-based pagination
    CurrentPage: page - 1,
  };

  if (!filters) return v3Filters;

  // Status/Area filter
  if (filters.isArchived) {
    v3Filters.Area = 'Archived';
  } else {
    v3Filters.Area = 'NotArchived';
  }

  // Category filter
  if (filters.area === 'new') {
    v3Filters.ResultCategory = 'New';
  } else if (filters.area === 'pathological') {
    v3Filters.ResultCategory = 'Pathological';
  } else if (filters.area === 'urgent') {
    v3Filters.ResultCategory = 'Urgent';
  }

  // Date filter
  if (filters.dateFrom) {
    v3Filters.StartDate = filters.dateFrom;
  }
  if (filters.dateTo) {
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

export function useResults(filter?: ResultFilter, page = 1) {
  return useQuery({
    queryKey: [RESULTS_KEY, filter, page],
    queryFn: async () => {
      // Build query params
      const params = mapFiltersToV3(filter, page);

      // labGate API v3 endpoint
      const response = await axiosInstance.get<ResultsResponseV3>('/api/v3/results', { params });

      return {
        Results: response.data.Results || [],
        TotalCount: response.data.TotalCount || 0,
        CurrentPage: response.data.CurrentPage || 0,
        ItemsPerPage: response.data.ItemsPerPage || ITEMS_PER_PAGE,
        TotalPages: response.data.TotalPages || 1,
      };
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

export function useResultCounter() {
  return useQuery({
    queryKey: [RESULTS_KEY, 'counter'],
    queryFn: async () => {
      const response = await axiosInstance.get<CounterResponseV3>('/api/v3/results/counter');
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
