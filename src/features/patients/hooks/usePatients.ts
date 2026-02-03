import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Patient } from '../../../api/types';

const PATIENTS_KEY = 'patients';

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

interface PatientsFilter {
  search?: string;
}

// V3 API patients list response (uses Items like other V3 endpoints)
interface PatientsResponseV3 {
  Items?: Patient[];
  Results?: Patient[];
  TotalItemsCount?: number;
  TotalCount?: number;
}

// Fetch patients with infinite scroll pagination
export function usePatients(filter?: PatientsFilter) {
  return useInfiniteQuery({
    queryKey: [PATIENTS_KEY, filter?.search],
    queryFn: async ({ pageParam = 1 }) => {
      const currentPageSize = getItemsPerPage(pageParam);

      const params: Record<string, string | number> = {
        itemsPerPage: currentPageSize,
        currentPage: pageParam,
        patientSortColumn: 'Lastname',
        patientSortDirection: 'Ascending',
      };

      // Add search query if provided
      if (filter?.search) {
        params.patientSearchQuery = filter.search;
      }

      const response = await axiosInstance.get<PatientsResponseV3>('/api/v3/patients', { params });
      // Support both Items (V3) and Results (legacy) field names
      const patients = response.data.Items || response.data.Results || [];
      const totalCount = response.data.TotalItemsCount || response.data.TotalCount || patients.length;

      return {
        Results: patients,
        TotalCount: totalCount,
        ItemsPerPage: currentPageSize,
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

// Get single patient with full details (includes Address, IsHzvPatient, InsurantIdent)
export function usePatient(id: string | number | undefined) {
  return useQuery({
    queryKey: [PATIENTS_KEY, 'detail', id],
    queryFn: async () => {
      const response = await axiosInstance.get<Patient>(`/api/v3/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Get results for a specific patient
export function usePatientResults(patientId: number | undefined) {
  interface ResultsResponseV3 {
    Results: unknown[];
    TotalCount?: number;
    CurrentPage?: number;
    TotalPages?: number;
  }

  return useQuery({
    queryKey: [PATIENTS_KEY, patientId, 'results'],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<ResultsResponseV3>(
        `/api/v3/patients/${patientId}/results`
      );
      return response.data.Results || [];
    },
    enabled: !!patientId,
  });
}
