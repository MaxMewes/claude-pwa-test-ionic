import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { useAuthStore } from '../../auth/store/authStore';

// V3 API Sender type
interface SenderV3 {
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
}

interface UseSendersParams {
  page?: number;
  pageSize?: number;
  query?: string;
}

export function useSenders(params: UseSendersParams = {}) {
  const { query } = params;
  const { selectedSender, setSelectedSender, isAuthenticated } = useAuthStore();

  const queryResult = useQuery({
    queryKey: ['senders', query],
    queryFn: async () => {
      // labGate API v3 endpoint returns { Senders: [...] }
      const response = await axiosInstance.get<SendersResponseV3>('/api/v3/senders');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Auto-select first sender if none selected
  useEffect(() => {
    if (queryResult.data?.Senders && queryResult.data.Senders.length > 0 && !selectedSender) {
      const firstSender = queryResult.data.Senders[0];
      setSelectedSender({
        Id: firstSender.Id,
        Firstname: firstSender.Firstname,
        Lastname: firstSender.Lastname,
        LaboratoryId: firstSender.LaboratoryId,
      });
    }
  }, [queryResult.data, selectedSender, setSelectedSender]);

  return {
    ...queryResult,
    senders: queryResult.data?.Senders || [],
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
