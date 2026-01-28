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
      const response = await axiosInstance.get<PaginatedResponse<NewsArticle>>('/news', {
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
      const response = await axiosInstance.get<NewsArticle>(`/news/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useMarkNewsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const response = await axiosInstance.patch(`/news/${newsId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NEWS_KEY] });
    },
  });
}
