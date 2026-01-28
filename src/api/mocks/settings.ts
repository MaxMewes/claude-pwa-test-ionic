import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserSettings } from '../types';
import { createMockResponse } from '../client/mockAdapter';

let mockUserSettings: UserSettings = {
  notifications: {
    enabled: true,
    newResults: true,
    criticalResults: true,
    news: true,
    reminders: false,
    sound: true,
    vibration: true,
  },
  biometric: {
    enabled: false,
    type: 'none',
  },
  display: {
    language: 'de',
    theme: 'system',
    fontSize: 'medium',
  },
  privacy: {
    shareAnalytics: true,
    showProfilePhoto: true,
  },
};

export const mockSettingsHandlers = {
  getSettings: async (): Promise<AxiosResponse<UserSettings>> => {
    return createMockResponse(mockUserSettings);
  },

  updateSettings: async (config: AxiosRequestConfig): Promise<AxiosResponse<UserSettings>> => {
    const updates = config.data as Partial<UserSettings>;

    // Deep merge the settings
    if (updates.notifications) {
      mockUserSettings.notifications = {
        ...mockUserSettings.notifications,
        ...updates.notifications,
      };
    }
    if (updates.biometric) {
      mockUserSettings.biometric = {
        ...mockUserSettings.biometric,
        ...updates.biometric,
      };
    }
    if (updates.display) {
      mockUserSettings.display = {
        ...mockUserSettings.display,
        ...updates.display,
      };
    }
    if (updates.privacy) {
      mockUserSettings.privacy = {
        ...mockUserSettings.privacy,
        ...updates.privacy,
      };
    }

    return createMockResponse(mockUserSettings);
  },
};
