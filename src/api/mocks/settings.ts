import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserSettings, PushNotificationSettings, PushSubscription } from '../types';
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

let pushSubscriptions: PushSubscription[] = [];

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

  // Push notification settings - labGate API v3
  getPushSettings: async (): Promise<AxiosResponse<PushNotificationSettings>> => {
    return createMockResponse(mockUserSettings.pushSettings);
  },

  updatePushSettings: async (config: AxiosRequestConfig): Promise<AxiosResponse<PushNotificationSettings>> => {
    const updates = config.data as Partial<PushNotificationSettings>;
    mockUserSettings.pushSettings = {
      ...mockUserSettings.pushSettings,
      ...updates,
    };
    return createMockResponse(mockUserSettings.pushSettings);
  },

  subscribePush: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const subscription = config.data as PushSubscription;
    // Store the subscription
    const existingIndex = pushSubscriptions.findIndex(s => s.endpoint === subscription.endpoint);
    if (existingIndex >= 0) {
      pushSubscriptions[existingIndex] = subscription;
    } else {
      pushSubscriptions.push(subscription);
    }
    console.log('Push subscription registered:', subscription.endpoint);
    return createMockResponse({ success: true });
  },

  unsubscribePush: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const { endpoint } = config.params as { endpoint: string };
    pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== endpoint);
    console.log('Push subscription removed:', endpoint);
    return createMockResponse({ success: true });
  },
};
