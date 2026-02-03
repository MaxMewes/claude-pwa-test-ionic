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

// labGate API v3 Auth Types
export interface LoginRequest {
  Username: string;
  Password: string;
  DeviceKey?: string;
  OperatingSystem?: 'Ios' | 'Android' | 'Windows' | 'Unknown';
  OperatingSystemVersion?: string;
  DeviceModel?: string;
  DeviceName?: string;
  AdditionalInformation?: string;
}

export interface LoginResponse {
  Token: string;
  PasswordExpired: boolean;
  RequiresSecondFactor: boolean;
  TwoFactorRegistrationIncomplete: boolean;
  UserPermissions: string[];
}

export interface TwoFactorRequest {
  TwoFactorCode: string;
}

export interface TwoFactorResponse {
  success: boolean;
}

export interface RegisterRequest {
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  Username: string;
  Email: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  OldPassword: string;
  NewPassword: string;
}

export interface PasswordRules {
  MinimumLength: number;
  RequireUppercase: boolean;
  RequireLowercase: boolean;
  RequireNumbers: boolean;
  RequireSpecialCharacters: boolean;
}

// Update Info Types
export interface AppUpdateInfoResponse {
  CurrentVersion?: string;
  MinimumVersion?: string;
  UpdateType: 'None' | 'Optional' | 'Required';
}

// labGate API v3 Result Types
export interface LabResult {
  Id: number;
  LabNo: string;
  Patient: ResultPatient;
  Sender?: ResultSender;
  Laboratory?: ResultLaboratory;
  ReportDate: string;
  OrderDate?: string;
  Status?: string;
  ResultType?: string;
  LaboratorySection?: string;
  IsFavorite: boolean;
  IsRead: boolean;
  IsArchived: boolean;
  IsPathological?: boolean;
  IsUrgent?: boolean;
  HasCriticalValues?: boolean;
  // API v3 actual field names
  IsPatho?: boolean;
  IsHighPatho?: boolean;
  IsEmergency?: boolean;
  HasDocuments?: boolean;
  IsConfirmable?: boolean;
  ResultData?: TestResult[];
  // Legacy fields for backwards compatibility
  id?: string;
  patientId?: string;
  patientName?: string;
  laboratoryId?: string;
  laboratoryName?: string;
  orderNumber?: string;
  collectionDate?: string;
  reportDate?: string;
  status?: ResultStatus;
  category?: ResultCategory;
  tests?: TestResult[];
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface ResultPatient {
  Id: number;
  Fullname?: string;
  Firstname?: string;
  Lastname?: string;
  PatientNumber?: string;
  DateOfBirth?: string;
}

export interface ResultSender {
  Id: number;
  Name: string;
  CustomerNo?: string;
}

export interface ResultLaboratory {
  Id: number;
  Name: string;
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
  Id: number;
  TestIdent: string;
  TestName: string;
  Value: string;
  Unit?: string;
  ReferenceRange?: string;
  ReferenceMin?: number;
  ReferenceMax?: number;
  IsPathological?: boolean;
  PathologyIndicator?: string;
  Comment?: string;
  // Legacy fields
  id?: string;
  name?: string;
  shortName?: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  flag?: ResultFlag;
  previousValue?: string;
  previousDate?: string;
  trend?: 'up' | 'down' | 'stable';
  history?: TestResultHistory[];
}

export interface TestResultHistory {
  Date: string;
  Value: string;
  NumericValue?: number;
  IsPathological?: boolean;
}

export type ResultFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' | 'abnormal';

export interface ResultDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Result types for filtering (German labGate categories)
export type ResultTypeFilter = 'final' | 'partial' | 'preliminary' | 'followUp' | 'archive';

// Lab categories for filtering
export type LabCategoryFilter = 'specialist' | 'labCommunity' | 'microbiology';

export interface ResultFilter {
  patientId?: string;
  patientIds?: string[];
  laboratoryId?: string;
  senderId?: string;
  senderIds?: string[];
  status?: ResultStatus[];
  resultType?: ResultType[];
  resultTypes?: ResultTypeFilter[]; // New filter types
  category?: ResultCategory[];
  labCategories?: LabCategoryFilter[]; // New lab categories
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  area?: 'new' | 'pathological' | 'highPathological' | 'urgent' | 'all';
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ResultCounter {
  Total: number;
  New: number;
  Pathological: number;
  Urgent: number;
  HighPathological?: number;
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

// Patient Types (labGate API v3 uses PascalCase)
export type GenderType = 'Unknown' | 'Female' | 'Male' | 'Undefined' | 'Diverse';
export type AccountType = 'Unknown' | 'PanelPatient' | 'PrivatePatient' | 'OtherInvoiceRecipient' | 'Sender';

export interface Patient {
  // API v3 fields (PascalCase) - from PatientGetListResponseEntry
  Id?: number;
  Firstname?: string;
  Lastname?: string;
  DateOfBirth?: string;
  Gender?: GenderType | number; // API v3 uses string enum, but results use numbers (1=female, 2=male)
  Age?: number;
  Title?: string;
  AddName?: string;
  PreWord?: string;
  AccountType?: AccountType;
  CreatedOn?: string;
  ModifiedOn?: string;
  Sender?: PatientSender;
  // Additional fields from PatientGetResponse (single patient endpoint)
  Address?: PatientStreetAddress;
  PostBox?: PatientPostBoxAddress;
  IsHzvPatient?: boolean;
  InsurantIdent?: string; // Versicherten-ID
  InsuranceIdent?: string; // Versicherungsnummer
  PatientNumber?: string;
  PhoneNumber?: string;
  Email?: string;
  // Computed/derived fields
  ResultCount?: number;
  LastResultDate?: string | null;
  HasPatho?: boolean;
  // Legacy fields (camelCase) for backwards compatibility
  id?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  insuranceNumber?: string;
  email?: string;
  phone?: string;
  address?: PatientAddressLegacy;
  lastVisit?: string;
  resultCount?: number;
}

export interface PatientStreetAddress {
  Street?: string;
  HouseNumber?: string;
  CountryCode?: string;
  Zip?: string;
  City?: string;
}

export interface PatientPostBoxAddress {
  Number?: string;
  CountryCode?: string;
  Zip?: string;
  City?: string;
}

export interface PatientSender {
  Id?: number;
  Firstname?: string;
  Lastname?: string;
  SiteName?: string;
}

export interface PatientAddressLegacy {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Laboratory Types (labGate API v3 uses PascalCase)
export interface Laboratory {
  // API v3 fields (PascalCase)
  Id?: number;
  Name?: string;
  Address?: LaboratoryAddress | null;
  Phone?: string | null;
  Email?: string | null;
  Website?: string | null;
  Contacts?: LaboratoryContact[];
  // Legacy fields (camelCase) for backwards compatibility
  id?: string;
  name?: string;
  shortName?: string;
  description?: string;
  address?: LaboratoryAddress;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  openingHours?: OpeningHours[];
  services?: string[];
  contacts?: LaboratoryContact[];
  accreditations?: string[];
  isActive?: boolean;
}

export interface LaboratoryAddress {
  // API v3 fields (PascalCase)
  Street?: string | null;
  Number?: string | null;
  HouseNumber?: string | null;
  Zip?: string | null;
  City?: string | null;
  CountryCode?: string | null;
  // Legacy fields (camelCase)
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
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

// API Response Types
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

// V3 API Query Parameters
export interface ResultQueryParams {
  StartDate?: string;
  EndDate?: string;
  Query?: string;
  ResultCategory?: 'None' | 'Favorites' | 'New' | 'Pathological' | 'Urgent' | 'HighPathological';
  ResultType?: string;
  PatientIds?: number[];
  SenderIds?: number[];
  Area?: 'NotArchived' | 'Archived' | 'All';
  CurrentPage?: number;
  ItemsPerPage?: number;
  SortColumn?: 'None' | 'ReportDate' | 'LabNo' | 'Patient' | 'KisVisitNumber';
  SortDirection?: 'None' | 'Descending' | 'Ascending';
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
