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

const validCredentials = {
  email: 'demo@labgate.de',
  password: 'demo123',
};

const twoFactorCode = '123456';

export const mockAuthHandlers = {
  login: async (config: AxiosRequestConfig): Promise<AxiosResponse<LoginResponse>> => {
    const { email, password } = config.data as LoginRequest;

    if (email === validCredentials.email && password === validCredentials.password) {
      return createMockResponse<LoginResponse>({
        accessToken: '',
        refreshToken: '',
        user: mockUser,
        requiresTwoFactor: true,
      });
    }

    throw createMockError('Ungueltige Anmeldedaten', 401, 'INVALID_CREDENTIALS');
  },

  twoFactor: async (config: AxiosRequestConfig): Promise<AxiosResponse<TwoFactorResponse>> => {
    const { code } = config.data as TwoFactorRequest;

    if (code === twoFactorCode) {
      return createMockResponse<TwoFactorResponse>({
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: mockUser,
      });
    }

    throw createMockError('Ungueltiger Code', 401, 'INVALID_CODE');
  },

  refresh: async (): Promise<AxiosResponse<{ accessToken: string; refreshToken: string }>> => {
    return createMockResponse({
      accessToken: 'mock-access-token-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
    });
  },

  logout: async (): Promise<AxiosResponse<{ success: boolean }>> => {
    return createMockResponse({ success: true });
  },

  getMe: async (): Promise<AxiosResponse<User>> => {
    return createMockResponse(mockUser);
  },

  changePassword: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const { currentPassword, newPassword } = config.data as {
      currentPassword: string;
      newPassword: string;
    };

    if (currentPassword === 'demo123' && newPassword && newPassword.length >= 8) {
      return createMockResponse({ success: true });
    }

    throw createMockError('Aktuelles Passwort ist falsch', 400, 'INVALID_PASSWORD');
  },

  register: async (config: AxiosRequestConfig): Promise<AxiosResponse<RegisterResponse>> => {
    const data = config.data as RegisterRequest;

    // Check if email already exists
    if (data.email === 'demo@labgate.de') {
      throw createMockError('Diese E-Mail-Adresse ist bereits registriert', 400, 'EMAIL_EXISTS');
    }

    // Validate password
    if (data.password.length < 8) {
      throw createMockError('Passwort muss mindestens 8 Zeichen lang sein', 400, 'PASSWORD_TOO_SHORT');
    }

    return createMockResponse<RegisterResponse>({
      success: true,
      message: 'Registrierung erfolgreich. Bitte pruefen Sie Ihre E-Mail zur Bestaetigung.',
    });
  },

  resetPassword: async (config: AxiosRequestConfig): Promise<AxiosResponse<ResetPasswordResponse>> => {
    const data = config.data as ResetPasswordRequest;

    // Simulate sending reset email
    console.log('Password reset requested for:', data.email);

    return createMockResponse<ResetPasswordResponse>({
      success: true,
      message: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie in Kuerze eine E-Mail mit weiteren Anweisungen.',
    });
  },

  getPasswordRules: async (): Promise<AxiosResponse<PasswordRules>> => {
    return createMockResponse<PasswordRules>({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    });
  },
};
