import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { useAuthStore } from '../../auth/store/authStore';

const ITEMS_PER_PAGE = 25;

// V3 API Sender type
export interface SenderV3 {
  Id: number;
  Firstname: string;
  Lastname: string;
  LaboratoryId: number;
  Site?: {
    Name: string;
    Address?: {
      Street: string | null;
      Zip: string | null;
      City: string | null;
      CountryCode: string | null;
    };
  };
  Contact?: {
    Email: string | null;
    Phone: string | null;
    Mobile: string | null;
  };
}

interface SendersResponseV3 {
  Senders: SenderV3[];
  TotalCount?: number;
  CurrentPage?: number;
  TotalPages?: number;
}

interface UseSendersParams {
  query?: string;
}

export function useSenders(params: UseSendersParams = {}) {
  const { query } = params;
  const { isAuthenticated } = useAuthStore();

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['senders', query],
    queryFn: async ({ pageParam = 1 }) => {
      // labGate API v3 endpoint returns { Senders: [...] }
      let url = `/api/v3/senders?itemsPerPage=${ITEMS_PER_PAGE}&currentPage=${pageParam}`;
      if (query) {
        url += `&query=${encodeURIComponent(query)}`;
      }
      const response = await axiosInstance.get<SendersResponseV3>(url);
      const senders = response.data.Senders || [];
      const totalCount = response.data.TotalCount ?? senders.length;
      const totalPages = response.data.TotalPages ?? Math.ceil(totalCount / ITEMS_PER_PAGE);
      return {
        Senders: senders,
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

  // Flatten paginated results
  const senders = useMemo(() => {
    return infiniteQuery.data?.pages?.flatMap((page) => page.Senders) || [];
  }, [infiniteQuery.data]);

  return {
    ...infiniteQuery,
    senders,
  };
}

export function useSender(id: number | undefined) {
  return useQuery({
    queryKey: ['sender', id],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<SenderV3>(`/api/v3/senders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
