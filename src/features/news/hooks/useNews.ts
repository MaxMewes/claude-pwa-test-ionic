import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { NewsArticle, NewsCategory } from '../../../api/types';
import { useAuthStore } from '../../auth/store/authStore';

const NEWS_KEY = 'news';
const ITEMS_PER_PAGE = 25;

// API v3 response format for news list
interface NewsListResponseV3 {
  Items: NewsArticle[];
  CurrentPage: number;
  ItemsPerPage: number;
  TotalItemsCount: number;
}

interface NewsFilter {
  category?: NewsCategory;
}

export function useNews(filter?: NewsFilter) {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: [NEWS_KEY, filter],
    queryFn: async ({ pageParam = 1 }) => {
      // labGate API v3 endpoint (1-based pagination)
      const response = await axiosInstance.get<NewsListResponseV3>('/api/v3/news', {
        params: {
          ...filter,
          itemsPerPage: ITEMS_PER_PAGE,
          currentPage: pageParam,
        },
      });
      const items = response.data.Items || [];
      const totalCount = response.data.TotalItemsCount ?? items.length;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      return {
        Results: items,
        TotalCount: totalCount,
        CurrentPage: pageParam,
        TotalPages: totalPages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.CurrentPage + 1;
      return nextPage <= lastPage.TotalPages ? nextPage : undefined;
    },
    enabled: isAuthenticated,
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
