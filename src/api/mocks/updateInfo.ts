import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AppUpdateInfoResponse } from '../types';
import { createMockResponse } from '../client/mockAdapter';

const LABGATE_VERSION = '25.4.1.0';

export const mockUpdateInfoHandlers = {
  getUpdateInfo: async (config: AxiosRequestConfig): Promise<AxiosResponse<AppUpdateInfoResponse>> => {
    // Get app version from query params
    const appVersion = config.params?.version || '0.0.1';

    // Simple version comparison logic
    const response: AppUpdateInfoResponse = {
      CurrentVersion: LABGATE_VERSION,
      MinimumVersion: '0.0.1',
      UpdateType: 'None', // For now, no updates available
    };

    // Simulate update check logic
    if (appVersion < '0.0.1') {
      response.UpdateType = 'Required';
    } else if (appVersion < LABGATE_VERSION) {
      response.UpdateType = 'Optional';
    }

    return createMockResponse(response);
  },
};
