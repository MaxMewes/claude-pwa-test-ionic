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
