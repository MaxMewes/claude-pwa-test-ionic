import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserSettings } from '../types';
import { createMockResponse } from '../client/mockAdapter';

let mockUserSettings: UserSettings = {
  notifications: {
    enabled: true,
    push: true,
    email: true,
    sms: false,
    newResults: true,
    criticalResults: true,
    news: true,
    reminders: false,
    sound: true,
    vibration: true,
  },
  pushSettings: {
    normalResults: true,
    urgentResults: true,
    confirmableResults: true,
    pathologicalResults: true,
    highPathologicalResults: true,
    news: true,
  },
  biometric: {
    enabled: false,
    type: 'none',
  },
  auth: {
    biometricEnabled: false,
    autoLogoutMinutes: 15,
    rememberDevice: true,
  },
  display: {
    language: 'de',
    theme: 'system',
    fontSize: 'medium',
    compactMode: false,
    showAvatars: true,
    animationsEnabled: true,
    dateFormat: 'DD.MM.YYYY',
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
    if (updates.pushSettings) {
      mockUserSettings.pushSettings = {
        ...mockUserSettings.pushSettings,
        ...updates.pushSettings,
      };
    }
    if (updates.biometric) {
      mockUserSettings.biometric = {
        ...mockUserSettings.biometric,
        ...updates.biometric,
      };
    }
    if (updates.auth) {
      mockUserSettings.auth = {
        ...mockUserSettings.auth,
        ...updates.auth,
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
