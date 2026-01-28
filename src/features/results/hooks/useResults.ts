import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult, PaginatedResponse, ResultFilter, ResultCounter, CumulativeResult, TestResultHistory } from '../../../api/types';

const RESULTS_KEY = 'results';

export function useResults(filter?: ResultFilter) {
  return useQuery({
    queryKey: [RESULTS_KEY, filter],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<PaginatedResponse<LabResult>>('/api/v3/results', {
        params: filter,
      });
      return response.data;
    },
  });
}

export function useResult(id: string | number | undefined) {
  return useQuery({
    queryKey: [RESULTS_KEY, id],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<LabResult>(`/api/v3/results/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useResultCounter() {
  return useQuery({
    queryKey: [RESULTS_KEY, 'counter'],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<ResultCounter>('/api/v3/results/counter');
      return response.data;
    },
  });
}

export function useResultTrend(resultId: string | number, testId: string | number) {
  return useQuery({
    queryKey: [RESULTS_KEY, resultId, 'trend', testId],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<TestResultHistory[]>(
        `/api/v3/results/${resultId}/trend/${testId}`
      );
      return response.data;
    },
    enabled: !!resultId && !!testId,
  });
}

export function useCumulativeResults(resultId: string | number | undefined) {
  return useQuery({
    queryKey: [RESULTS_KEY, resultId, 'cumulative'],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<CumulativeResult[]>(
        `/api/v3/results/${resultId}/cumulative`
      );
      return response.data;
    },
    enabled: !!resultId,
  });
}

export function useMarkResultAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-read', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-unread', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-favorite', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsNotFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-not-favorite', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-archived', resultIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useMarkResultAsNotArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultIds: number[]) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch('/api/v3/results/mark-as-not-archived', resultIds);
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
    mutationFn: async (resultId: number) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.patch(`/api/v3/results/${resultId}/pin`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}
