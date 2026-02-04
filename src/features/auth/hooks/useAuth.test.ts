import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies
vi.mock('@ionic/react', () => ({
  useIonRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    requiresTwoFactor: false,
    tempToken: null,
    username: null,
    setUser: vi.fn(),
    setToken: vi.fn(),
    setTempToken: vi.fn(),
    setPasswordExpired: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../../../shared/store/useSettingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    reset: vi.fn(),
  })),
}));

vi.mock('../../../api/services/authService', () => ({
  authService: {
    login: vi.fn(),
    verifyTwoFactor: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
  },
  LoginCredentials: {},
}));

import { useAuth } from './useAuth';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../../../shared/store/useSettingsStore';
import { authService } from '../../../api/services/authService';

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);
const mockAuthService = vi.mocked(authService);

// Create wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAuth', () => {
  const mockSetUser = vi.fn();
  const mockSetToken = vi.fn();
  const mockSetTempToken = vi.fn();
  const mockSetPasswordExpired = vi.fn();
  const mockStoreLogout = vi.fn();
  const mockResetSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      requiresTwoFactor: false,
      tempToken: null,
      username: null,
      setUser: mockSetUser,
      setToken: mockSetToken,
      setTempToken: mockSetTempToken,
      setPasswordExpired: mockSetPasswordExpired,
      logout: mockStoreLogout,
    } as ReturnType<typeof useAuthStore>);

    mockUseSettingsStore.mockReturnValue({
      reset: mockResetSettings,
    } as unknown as ReturnType<typeof useSettingsStore>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return user from auth store', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'doctor' as const,
        permissions: [],
        createdAt: '2024-01-01',
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        requiresTwoFactor: false,
        tempToken: null,
        username: null,
        setUser: mockSetUser,
        setToken: mockSetToken,
        setTempToken: mockSetTempToken,
        setPasswordExpired: mockSetPasswordExpired,
        logout: mockStoreLogout,
      } as ReturnType<typeof useAuthStore>);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return requiresTwoFactor from auth store', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        requiresTwoFactor: true,
        tempToken: 'temp-token',
        username: 'testuser',
        setUser: mockSetUser,
        setToken: mockSetToken,
        setTempToken: mockSetTempToken,
        setPasswordExpired: mockSetPasswordExpired,
        logout: mockStoreLogout,
      } as ReturnType<typeof useAuthStore>);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.requiresTwoFactor).toBe(true);
    });

    it('should not be logging in initially', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoggingIn).toBe(false);
    });

    it('should not be logging out initially', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoggingOut).toBe(false);
    });
  });

  describe('login', () => {
    it('should call authService.login with credentials', async () => {
      mockAuthService.login.mockResolvedValueOnce({
        token: 'auth-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'doctor' as const,
          permissions: [],
          createdAt: '2024-01-01',
        },
        requiresTwoFactor: false,
        passwordExpired: false,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login({ username: 'testuser', password: 'password123' });
      });

      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should call setUser and setToken on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'doctor' as const,
        permissions: [],
        createdAt: '2024-01-01',
      };

      mockAuthService.login.mockResolvedValueOnce({
        token: 'auth-token',
        user: mockUser,
        requiresTwoFactor: false,
        passwordExpired: false,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login({ username: 'testuser', password: 'password123' });
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockSetToken).toHaveBeenCalledWith('auth-token');
      });
    });

    it('should call setTempToken when 2FA is required', async () => {
      mockAuthService.login.mockResolvedValueOnce({
        tempToken: 'temp-token-123',
        token: '',
        user: {
          id: '1',
          email: '',
          username: 'testuser',
          firstName: '',
          lastName: '',
          role: 'doctor' as const,
          permissions: [],
          createdAt: '2024-01-01',
        },
        requiresTwoFactor: true,
        passwordExpired: false,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login({ username: 'testuser', password: 'password123' });
      });

      await waitFor(() => {
        expect(mockSetTempToken).toHaveBeenCalledWith('temp-token-123', 'testuser');
      });
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      mockAuthService.logout.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled();
      });
    });

    it('should clear stores on logout', async () => {
      mockAuthService.logout.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(mockStoreLogout).toHaveBeenCalled();
        expect(mockResetSettings).toHaveBeenCalled();
      });
    });

    it('should still clear stores even if logout API fails', async () => {
      mockAuthService.logout.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        // onSettled runs regardless of success/failure
        expect(mockStoreLogout).toHaveBeenCalled();
        expect(mockResetSettings).toHaveBeenCalled();
      });
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      mockAuthService.changePassword.mockResolvedValueOnce(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.changePassword('oldPassword', 'newPassword');
      });

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('oldPassword', 'newPassword');
    });

    it('should throw error on failed password change', async () => {
      const changeError = new Error('Password requirements not met');
      mockAuthService.changePassword.mockRejectedValueOnce(changeError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.changePassword('old', 'new');
        })
      ).rejects.toThrow('Password requirements not met');
    });
  });

  describe('verifyTwoFactor', () => {
    it('should call authService.verifyTwoFactor with code', async () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        requiresTwoFactor: true,
        tempToken: 'temp-token-123',
        username: 'testuser',
        setUser: mockSetUser,
        setToken: mockSetToken,
        setTempToken: mockSetTempToken,
        setPasswordExpired: mockSetPasswordExpired,
        logout: mockStoreLogout,
      } as ReturnType<typeof useAuthStore>);

      mockAuthService.verifyTwoFactor.mockResolvedValueOnce({
        token: 'auth-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'doctor' as const,
          permissions: [],
          createdAt: '2024-01-01',
        },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.verifyTwoFactor('123456');
      });

      await waitFor(() => {
        expect(mockAuthService.verifyTwoFactor).toHaveBeenCalledWith('123456', 'testuser', 'temp-token-123');
      });
    });
  });

  describe('error handling', () => {
    it('should expose login error', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValueOnce(loginError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login({ username: 'testuser', password: 'wrongpassword' });
      });

      await waitFor(() => {
        expect(result.current.loginError).toBeDefined();
      });
    });
  });
});
