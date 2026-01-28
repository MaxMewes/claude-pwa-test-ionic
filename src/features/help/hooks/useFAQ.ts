import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { FAQ, PaginatedResponse } from '../../../api/types';

export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await axiosInstance.get<PaginatedResponse<FAQ>>('/faqs', {
        params: { itemsPerPage: 100 },
      });
      return response.data;
    },
  });
}

export function useFAQ(id: string | undefined) {
  return useQuery({
    queryKey: ['faq', id],
    queryFn: async () => {
      const response = await axiosInstance.get<FAQ>(`/faqs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
