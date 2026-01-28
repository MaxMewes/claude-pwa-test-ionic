import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  TwoFactorRequest,
  TwoFactorResponse,
  User,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  PasswordRules,
  ChangePasswordRequest,
} from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockUser: User = {
  id: 'user-001',
  email: 'dr.mueller@praxis.de',
  firstName: 'Thomas',
  lastName: 'Mueller',
  role: 'doctor',
  permissions: [
    'view_results',
    'view_patients',
    'manage_patients',
    'view_laboratories',
    'view_news',
    'manage_settings',
  ],
  createdAt: '2023-01-15T10:00:00Z',
};

// labGate API v3 uses Username/Password
const validCredentials = {
  username: 'demo',
  password: 'demo123',
};

const twoFactorCode = '123456';

export const mockAuthHandlers = {
  login: async (config: AxiosRequestConfig): Promise<AxiosResponse<LoginResponse>> => {
    const { Username, Password } = config.data as LoginRequest;

    if (Username === validCredentials.username && Password === validCredentials.password) {
      // labGate API v3 response format
      return createMockResponse<LoginResponse>({
        Token: '',
        PasswordExpired: false,
        RequiresSecondFactor: true,
        TwoFactorRegistrationIncomplete: false,
        UserPermissions: ['view_results', 'view_patients', 'manage_patients', 'view_laboratories', 'view_news', 'manage_settings'],
      });
    }

    throw createMockError('Ungueltige Anmeldedaten', 401, 'INVALID_CREDENTIALS');
  },

  twoFactor: async (config: AxiosRequestConfig): Promise<AxiosResponse<TwoFactorResponse>> => {
    const { TwoFactorCode } = config.data as TwoFactorRequest;

    if (TwoFactorCode === twoFactorCode) {
      return createMockResponse<TwoFactorResponse>({
        success: true,
      });
    }

    throw createMockError('Ungueltiger Code', 401, 'INVALID_CODE');
  },

  refresh: async (): Promise<AxiosResponse<{ Token: string }>> => {
    return createMockResponse({
      Token: 'mock-token-refreshed-' + Date.now(),
    });
  },

  logout: async (): Promise<AxiosResponse<{ success: boolean }>> => {
    return createMockResponse({ success: true });
  },

  getMe: async (): Promise<AxiosResponse<User>> => {
    return createMockResponse(mockUser);
  },

  changePassword: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const { OldPassword, NewPassword } = config.data as ChangePasswordRequest;

    if (OldPassword === 'demo123' && NewPassword && NewPassword.length >= 8) {
      return createMockResponse({ success: true });
    }

    throw createMockError('Aktuelles Passwort ist falsch', 400, 'INVALID_PASSWORD');
  },

  register: async (config: AxiosRequestConfig): Promise<AxiosResponse<RegisterResponse>> => {
    const data = config.data as RegisterRequest;

    // Check if username already exists
    if (data.Username === 'demo') {
      throw createMockError('Dieser Benutzername ist bereits vergeben', 400, 'USERNAME_EXISTS');
    }

    return createMockResponse<RegisterResponse>({
      success: true,
      message: 'Registrierung erfolgreich. Bitte pruefen Sie Ihre E-Mail zur Bestaetigung.',
    });
  },

  resetPassword: async (config: AxiosRequestConfig): Promise<AxiosResponse<ResetPasswordResponse>> => {
    const data = config.data as ResetPasswordRequest;

    // Simulate sending reset email
    console.log('Password reset requested for:', data.Username, data.Email);

    return createMockResponse<ResetPasswordResponse>({
      success: true,
      message: 'Falls ein Konto mit diesen Daten existiert, erhalten Sie in Kuerze eine E-Mail mit weiteren Anweisungen.',
    });
  },

  getPasswordRules: async (): Promise<AxiosResponse<PasswordRules>> => {
    // labGate API v3 password rules format
    return createMockResponse<PasswordRules>({
      MinimumLength: 8,
      RequireUppercase: true,
      RequireLowercase: true,
      RequireNumbers: true,
      RequireSpecialCharacters: false,
    });
  },
};
