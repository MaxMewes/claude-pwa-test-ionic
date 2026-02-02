import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { FAQ, PaginatedResponse } from '../../../api/types';

const ITEMS_PER_PAGE = 25;

export const useFAQ = () => {
  return useInfiniteQuery({
    queryKey: ['faq'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get<PaginatedResponse<FAQ>>('/api/v3/faq', {
        params: {
          itemsPerPage: ITEMS_PER_PAGE,
          currentPage: pageParam,
        },
      });
      const results = response.data.Results || [];
      const totalCount = response.data.TotalCount ?? results.length;
      const totalPages = response.data.TotalPages ?? Math.ceil(totalCount / ITEMS_PER_PAGE);
      return {
        Results: results,
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
    staleTime: 1000 * 60 * 60, // 1 hour - FAQs don't change often
  });
};
