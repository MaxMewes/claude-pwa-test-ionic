import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { AppUpdateInfoResponse } from '../../../api/types';

const APP_VERSION = '0.0.1'; // Should match package.json

export const useUpdateInfo = () => {
  return useQuery({
    queryKey: ['update-info', APP_VERSION],
    queryFn: async () => {
      const response = await axiosInstance.get<AppUpdateInfoResponse>(
        '/api/v3/mobile-apps/update-info',
        {
          params: {
            version: APP_VERSION,
          },
        }
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1, // Only retry once if it fails
  });
};
