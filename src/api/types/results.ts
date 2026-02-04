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
