import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../../../api/types';

interface AuthState {
  user: User | null;
  token: string | null; // labGate API v3 uses single Token
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  passwordExpired: boolean;
  twoFactorRegistrationIncomplete: boolean;
  userPermissions: string[];
  lastActivity: number;
  pin: string | null;
  biometricEnabled: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setLoginResponse: (response: {
    Token: string;
    RequiresSecondFactor: boolean;
    PasswordExpired: boolean;
    TwoFactorRegistrationIncomplete: boolean;
    UserPermissions: string[];
  }) => void;
  setRequiresTwoFactor: (requires: boolean) => void;
  setPin: (pin: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  updateLastActivity: () => void;
  logout: () => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'labgate-auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      requiresTwoFactor: false,
      passwordExpired: false,
      twoFactorRegistrationIncomplete: false,
      userPermissions: [],
      lastActivity: Date.now(),
      pin: null,
      biometricEnabled: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          lastActivity: Date.now(),
        }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: true,
          requiresTwoFactor: false,
          lastActivity: Date.now(),
        }),

      setLoginResponse: (response) =>
        set({
          token: response.Token || null,
          requiresTwoFactor: response.RequiresSecondFactor,
          passwordExpired: response.PasswordExpired,
          twoFactorRegistrationIncomplete: response.TwoFactorRegistrationIncomplete,
          userPermissions: response.UserPermissions,
          isAuthenticated: !response.RequiresSecondFactor && !!response.Token,
          lastActivity: Date.now(),
        }),

      setRequiresTwoFactor: (requires) =>
        set({
          requiresTwoFactor: requires,
        }),

      setPin: (pin) => set({ pin }),

      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),

      updateLastActivity: () => set({ lastActivity: Date.now() }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          requiresTwoFactor: false,
          passwordExpired: false,
          twoFactorRegistrationIncomplete: false,
          userPermissions: [],
          lastActivity: Date.now(),
        }),

      clearSession: () =>
        set({
          token: null,
          isAuthenticated: false,
          requiresTwoFactor: false,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        userPermissions: state.userPermissions,
        pin: state.pin,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
);
