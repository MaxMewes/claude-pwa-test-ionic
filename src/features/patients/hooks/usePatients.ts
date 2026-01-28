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
      const response = await axiosInstance.get<PaginatedResponse<Patient>>('/patients', {
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
      const response = await axiosInstance.get<Patient>(`/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
