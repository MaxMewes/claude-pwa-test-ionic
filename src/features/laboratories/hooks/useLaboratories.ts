import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Laboratory, PaginatedResponse } from '../../../api/types';

const LABORATORIES_KEY = 'laboratories';

interface LaboratoriesFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useLaboratories(filter?: LaboratoriesFilter) {
  return useQuery({
    queryKey: [LABORATORIES_KEY, filter],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<PaginatedResponse<Laboratory>>('/api/v3/laboratories', {
        params: filter,
      });
      return response.data;
    },
  });
}

export function useLaboratory(id: string | undefined) {
  return useQuery({
    queryKey: [LABORATORIES_KEY, id],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<Laboratory>(`/api/v3/laboratories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
