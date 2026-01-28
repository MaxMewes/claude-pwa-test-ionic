// Auth Types
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  laboratoryId?: string;
  avatar?: string;
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
  deviceKey?: string;
  deviceName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresTwoFactor: boolean;
  passwordExpired?: boolean;
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

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

// Result Types
export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  laboratoryId: string;
  laboratoryName: string;
  senderId?: string;
  senderName?: string;
  orderNumber: string;
  collectionDate: string;
  reportDate: string;
  status: ResultStatus;
  resultType: ResultType;
  category: ResultCategory;
  tests: TestResult[];
  isRead: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isPinned: boolean;
  isConfirmed?: boolean;
  pdfUrl?: string;
  documents?: ResultDocument[];
  comments?: string;
}

export type ResultStatus = 'pending' | 'partial' | 'final' | 'corrected';

export type ResultType = 'E' | 'T' | 'V' | 'N' | 'A'; // E=Final, T=Partial, V=Preliminary, N=Follow-up, A=Archive

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
  valueText?: string;
  unit: string;
  referenceRange: string;
  referenceMin?: number;
  referenceMax?: number;
  flag: ResultFlag;
  previousValue?: string;
  previousDate?: string;
  trend?: 'up' | 'down' | 'stable';
  history?: TestResultHistory[];
}

export interface TestResultHistory {
  date: string;
  value: string;
  numericValue?: number;
  flag: ResultFlag;
}

export type ResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';

export interface ResultDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ResultFilter {
  patientId?: string;
  patientIds?: string[];
  laboratoryId?: string;
  senderId?: string;
  senderIds?: string[];
  status?: ResultStatus[];
  resultType?: ResultType[];
  category?: ResultCategory[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  area?: 'new' | 'pathological' | 'urgent' | 'all';
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ResultCounter {
  total: number;
  new: number;
  pathological: number;
  urgent: number;
  highPathological: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface CumulativeResult {
  testName: string;
  unit: string;
  referenceMin?: number;
  referenceMax?: number;
  history: TrendDataPoint[];
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
  description?: string;
  address: LaboratoryAddress;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  openingHours: OpeningHours[];
  services: string[];
  contacts: LaboratoryContact[];
  accreditations?: string[];
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

export interface LaboratoryContact {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// Laboratory Service Catalog Types
export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  section: string;
  sectionId: string;
  material?: string;
  method?: string;
  unit?: string;
  referenceRange?: string;
  turnaroundTime?: string;
  price?: number;
  notes?: string;
}

export interface ServiceCatalogSection {
  id: string;
  name: string;
  itemCount: number;
}

// Laboratory Messaging Types
export interface LaboratoryMessage {
  id: string;
  laboratoryId: string;
  senderId?: string;
  resultId?: string;
  topicId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

export interface SendMessageRequest {
  laboratoryId: string;
  senderId?: string;
  resultId?: string;
  topicId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Sender (Physician) Types
export interface Sender {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  siteName?: string;
  specialField?: string;
  customerNo?: string;
  laboratoryId?: string;
  address?: SenderAddress;
  contact?: SenderContact;
}

export interface SenderAddress {
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
}

export interface SenderContact {
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
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
