import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, PaginatedResponse, ResultFilter, TrendDataPoint } from '../../../api/types';

const RESULTS_KEY = 'results';

export function useResults(filter?: ResultFilter) {
  return useQuery({
    queryKey: [RESULTS_KEY, filter],
    queryFn: async () => {
      const response = await axiosInstance.get<PaginatedResponse<LabResult>>('/results', {
        params: filter,
      });
      return response.data;
    },
  });
}

export function useResult(id: string | undefined) {
  return useQuery({
    queryKey: [RESULTS_KEY, id],
    queryFn: async () => {
      const response = await axiosInstance.get<LabResult>(`/results/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useResultTrend(resultId: string, testId: string) {
  return useQuery({
    queryKey: [RESULTS_KEY, resultId, 'trend', testId],
    queryFn: async () => {
      const response = await axiosInstance.get<TrendDataPoint[]>(
        `/results/${resultId}/trend/${testId}`
      );
      return response.data;
    },
    enabled: !!resultId && !!testId,
  });
}

export function useMarkResultAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultId: string) => {
      const response = await axiosInstance.patch(`/results/${resultId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useToggleResultPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultId: string) => {
      const response = await axiosInstance.patch(`/results/${resultId}/pin`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}
