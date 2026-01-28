import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { NewsArticle, PaginatedResponse, NewsCategory } from '../../../api/types';

const NEWS_KEY = 'news';

interface NewsFilter {
  category?: NewsCategory;
  page?: number;
  pageSize?: number;
}

export function useNews(filter?: NewsFilter) {
  return useQuery({
    queryKey: [NEWS_KEY, filter],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<PaginatedResponse<NewsArticle>>('/api/v3/news', {
        params: filter,
      });
      return response.data;
    },
  });
}

export function useNewsArticle(id: string | undefined) {
  return useQuery({
    queryKey: [NEWS_KEY, id],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<NewsArticle>(`/api/v3/news/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useMarkNewsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`/api/v3/news/${newsId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NEWS_KEY] });
    },
  });
}
