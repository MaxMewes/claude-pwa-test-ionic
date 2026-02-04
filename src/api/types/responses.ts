// API Response Types

// Generic API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// labGate API v3 Paginated Response
export interface PaginatedResponse<T> {
  Results: T[];
  TotalCount: number;
  CurrentPage: number;
  ItemsPerPage: number;
  TotalPages?: number;
}

// API Error Response
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Update Info Types
export interface AppUpdateInfoResponse {
  CurrentVersion?: string;
  MinimumVersion?: string;
  UpdateType: 'None' | 'Optional' | 'Required';
}

// News Types (API v3 format)
export interface NewsArticleUser {
  Firstname?: string;
  Name?: string;
  Fullname?: string;
}

export interface NewsArticle {
  // API v3 fields (PascalCase)
  Id?: number;
  Title?: string;
  Teaser?: string;
  Content?: string;
  Importance?: 'Normal' | 'High';
  Created?: string;
  CreatedBy?: NewsArticleUser;
  IsContentFormatted?: boolean;
  ImageUrl?: string;
  // Legacy fields for backward compatibility (camelCase)
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  category?: NewsCategory;
  imageUrl?: string;
  publishedAt?: string;
  author?: string;
  isRead?: boolean;
  isPinned?: boolean;
}

export type NewsCategory = 'announcement' | 'health_tip' | 'laboratory_news' | 'app_update';

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Feedback Types
export interface FeedbackRequest {
  type: FeedbackType;
  subject: string;
  message: string;
  email?: string;
}

export type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

export interface FeedbackResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

// Settings Types
export interface UserSettings {
  notifications: NotificationSettings;
  pushSettings: PushNotificationSettings;
  biometric: BiometricSettings;
  auth: AuthSettings;
  display: DisplaySettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
  newResults: boolean;
  criticalResults: boolean;
  news: boolean;
  reminders: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface PushNotificationSettings {
  normalResults: boolean;
  urgentResults: boolean;
  confirmableResults: boolean;
  pathologicalResults: boolean;
  highPathologicalResults: boolean;
  news: boolean;
}

export interface BiometricSettings {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'none';
}

export interface AuthSettings {
  biometricEnabled: boolean;
  autoLogoutMinutes: number;
  rememberDevice: boolean;
}

export interface DisplaySettings {
  language: 'de' | 'en' | 'fr' | 'es';
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAvatars: boolean;
  animationsEnabled: boolean;
  dateFormat: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY';
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  showProfilePhoto: boolean;
}

// Push Subscription Types
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
