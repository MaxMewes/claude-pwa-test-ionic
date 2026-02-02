import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Patient } from '../../../api/types';

const PATIENTS_KEY = 'patients';

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

// Fetch all patients without pagination
export function usePatients(filter?: PatientsFilter) {
  return useQuery({
    queryKey: [PATIENTS_KEY, filter?.search],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        itemsPerPage: 1000, // Fetch all at once
        currentPage: 1,
        patientSortColumn: 'Lastname',
        patientSortDirection: 'Ascending',
      };

      // Add search query if provided
      if (filter?.search) {
        params.patientSearchQuery = filter.search;
      }

      const response = await axiosInstance.get<PatientsResponseV3>('/api/v3/patients', { params });
      // Support both Items (V3) and Results (legacy) field names
      return response.data.Items || response.data.Results || [];
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
