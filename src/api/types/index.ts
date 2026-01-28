// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  laboratoryId?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'lab_technician';

export type Permission =
  | 'view_results'
  | 'view_patients'
  | 'manage_patients'
  | 'view_laboratories'
  | 'manage_laboratories'
  | 'view_news'
  | 'manage_news'
  | 'manage_settings';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresTwoFactor: boolean;
}

export interface TwoFactorRequest {
  code: string;
  sessionToken: string;
}

export interface TwoFactorResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Result Types
export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  laboratoryId: string;
  laboratoryName: string;
  orderNumber: string;
  collectionDate: string;
  reportDate: string;
  status: ResultStatus;
  category: ResultCategory;
  tests: TestResult[];
  isRead: boolean;
  isPinned: boolean;
  pdfUrl?: string;
}

export type ResultStatus = 'pending' | 'partial' | 'final' | 'corrected';

export type ResultCategory =
  | 'hematology'
  | 'chemistry'
  | 'immunology'
  | 'microbiology'
  | 'urinalysis'
  | 'coagulation'
  | 'other';

export interface TestResult {
  id: string;
  name: string;
  shortName: string;
  value: string;
  unit: string;
  referenceRange: string;
  referenceMin?: number;
  referenceMax?: number;
  flag: ResultFlag;
  previousValue?: string;
  previousDate?: string;
  trend?: 'up' | 'down' | 'stable';
}

export type ResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';

export interface ResultFilter {
  patientId?: string;
  laboratoryId?: string;
  status?: ResultStatus[];
  category?: ResultCategory[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isRead?: boolean;
  isPinned?: boolean;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

// Patient Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  insuranceNumber?: string;
  email?: string;
  phone?: string;
  address?: PatientAddress;
  lastVisit?: string;
  resultCount: number;
}

export interface PatientAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Laboratory Types
export interface Laboratory {
  id: string;
  name: string;
  shortName: string;
  address: LaboratoryAddress;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  openingHours: OpeningHours[];
  services: string[];
  isActive: boolean;
}

export interface LaboratoryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// News Types
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  imageUrl?: string;
  publishedAt: string;
  author: string;
  isRead: boolean;
  isPinned: boolean;
}

export type NewsCategory = 'announcement' | 'health_tip' | 'laboratory_news' | 'app_update';

// Settings Types
export interface UserSettings {
  notifications: NotificationSettings;
  biometric: BiometricSettings;
  display: DisplaySettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  newResults: boolean;
  criticalResults: boolean;
  news: boolean;
  reminders: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface BiometricSettings {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'none';
}

export interface DisplaySettings {
  language: 'de' | 'en';
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  showProfilePhoto: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
