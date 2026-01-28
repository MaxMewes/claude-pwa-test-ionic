import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Patient, PaginatedResponse } from '../../../api/types';

const PATIENTS_KEY = 'patients';

interface PatientsFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export function usePatients(filter?: PatientsFilter) {
  return useQuery({
    queryKey: [PATIENTS_KEY, filter],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<PaginatedResponse<Patient>>('/api/v3/patients', {
        params: filter,
      });
      return response.data;
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<Patient>(`/api/v3/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
