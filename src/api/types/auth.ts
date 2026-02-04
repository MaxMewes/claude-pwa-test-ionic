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
