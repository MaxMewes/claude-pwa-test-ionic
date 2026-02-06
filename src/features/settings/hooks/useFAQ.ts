import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { FAQ, FAQListResponse } from '../../../api/types';
import { SETTINGS_ENDPOINTS } from '../../../api/endpoints';

export const useFAQ = () => {
  return useQuery({
    queryKey: ['faq'],
    queryFn: async (): Promise<FAQ[]> => {
      const response = await axiosInstance.get<FAQListResponse>(SETTINGS_ENDPOINTS.FAQ);
      return response.data.Items || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - FAQs don't change often
  });
};
