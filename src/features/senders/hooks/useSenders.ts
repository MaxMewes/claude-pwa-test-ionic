import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Sender, PaginatedResponse } from '../../../api/types';

interface UseSendersParams {
  page?: number;
  pageSize?: number;
  query?: string;
}

export function useSenders(params: UseSendersParams = {}) {
  const { page = 1, pageSize = 20, query } = params;

  return useQuery({
    queryKey: ['senders', page, pageSize, query],
    queryFn: async () => {
      const response = await axiosInstance.get<PaginatedResponse<Sender>>('/senders', {
        params: { currentPage: page, itemsPerPage: pageSize, query },
      });
      return response.data;
    },
  });
}

export function useSender(id: string | undefined) {
  return useQuery({
    queryKey: ['sender', id],
    queryFn: async () => {
      const response = await axiosInstance.get<Sender>(`/senders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
