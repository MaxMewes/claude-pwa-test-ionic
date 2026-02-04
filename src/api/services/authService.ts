import { axiosInstance } from '../client/axiosInstance';
import type { User } from '../../features/auth/store/authStore';

// labGate API V2 Request/Response types
interface LoginRequestV2 {
  Username: string;
  Password: string;
  DeviceKey: string;
  OperatingSystem: string;
  OperatingSystemVersion: string;
  DeviceModel: string;
  DeviceName: string;
  AdditionalInformation: string;
}

interface LoginResponseV2 {
  Token: string;
  TempToken?: string;
  PasswordExpired: boolean;
  RequiresSecondFactor: boolean;
  TwoFactorRegistrationIncomplete?: boolean;
  Fullname?: string;
  FullName?: string;
  Name?: string;
  Firstname?: string;
  FirstName?: string;
  Lastname?: string;
  LastName?: string;
  Email?: string;
  EMail?: string;
}

interface TwoFactorRequestV3 {
  Username: string;
  TempToken: string;
  Code: string;
}

interface ResetPasswordRequestV3 {
  Username?: string;
  Email?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  tempToken?: string;
  requiresTwoFactor?: boolean;
  passwordExpired?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Parse fullname into first and last name
function parseFullname(fullname?: string): { firstName: string; lastName: string } {
  if (!fullname) return { firstName: '', lastName: '' };
  const parts = fullname.trim().split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const request: LoginRequestV2 = {
      Username: credentials.username,
      Password: credentials.password,
      DeviceKey: 'LabGate-PWA',
      OperatingSystem: navigator.platform || '',
      OperatingSystemVersion: '',
      DeviceModel: '1.0.0',
      DeviceName: 'LabGate-PWA',
      AdditionalInformation: '',
    };

    console.log('[AUTH] Login Request:', { ...request, Password: '***' });

    const response = await axiosInstance.post<LoginResponseV2>('/Api/V2/Authentication/Authorize', request);
    const data = response.data;

    // Only log in development, never log tokens in production
    if (import.meta.env.DEV) {
      console.log('[AUTH] Login Response (dev only):', { ...data, Token: data.Token ? '***' : undefined, TempToken: data.TempToken ? '***' : undefined });
    }

    if (data.RequiresSecondFactor) {
      return {
        user: {
          id: '1',
          email: data.Email || data.EMail || '',
          firstName: '',
          lastName: '',
          role: 'doctor',
          permissions: [],
          createdAt: new Date().toISOString(),
        },
        token: '',
        tempToken: data.Token || data.TempToken || '',
        requiresTwoFactor: true,
        passwordExpired: data.PasswordExpired,
      };
    }

    const fullname = data.Fullname || data.FullName || data.Name || '';
    const { firstName, lastName } = parseFullname(fullname);

    return {
      user: {
        id: '1',
        email: data.Email || data.EMail || credentials.username,
        username: credentials.username,
        firstName: data.Firstname || data.FirstName || firstName,
        lastName: data.Lastname || data.LastName || lastName,
        role: 'doctor',
        permissions: [],
        createdAt: new Date().toISOString(),
      },
      token: data.Token,
      requiresTwoFactor: false,
      passwordExpired: data.PasswordExpired,
    };
  },

  async verifyTwoFactor(
    pin: string,
    username: string,
    tempToken: string
  ): Promise<LoginResponse> {
    const request: TwoFactorRequestV3 = {
      Username: username,
      TempToken: tempToken,
      Code: pin,
    };

    const response = await axiosInstance.post<LoginResponseV2>('/Api/V2/Authentication/Verify2FALogin', request);
    const data = response.data;

    const fullname = data.Fullname || data.FullName || data.Name || '';
    const { firstName, lastName } = parseFullname(fullname);

    return {
      user: {
        id: '1',
        email: data.Email || data.EMail || '',
        firstName: data.Firstname || data.FirstName || firstName,
        lastName: data.Lastname || data.LastName || lastName,
        role: 'doctor',
        permissions: [],
        createdAt: new Date().toISOString(),
      },
      token: data.Token,
    };
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/authentication/logout');
    } catch (error) {
      // Ignore logout errors
      console.log('[AUTH] Logout error (ignored):', error);
    }
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponseV2>('/authentication/register', {
      Firstname: data.firstName,
      Lastname: data.lastName,
      Email: data.email,
      Password: data.password,
    });
    const responseData = response.data;

    return {
      user: {
        id: '1',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'doctor',
        permissions: [],
        createdAt: new Date().toISOString(),
      },
      token: responseData.Token,
    };
  },

  async requestPasswordReset(email: string): Promise<void> {
    const request: ResetPasswordRequestV3 = {
      Email: email,
    };
    await axiosInstance.post('/authentication/reset-password', request);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/Api/V2/Authentication/ChangePassword', {
      OldPassword: oldPassword,
      NewPassword: newPassword,
    });
  },

  async getPasswordRules(): Promise<{
    MinLength: number;
    RequireDigit: boolean;
    RequireUppercase: boolean;
    RequireLowercase: boolean;
    RequireSpecialChar: boolean;
  }> {
    const response = await axiosInstance.get('/authentication/passwords/rules');
    return response.data;
  },
};
