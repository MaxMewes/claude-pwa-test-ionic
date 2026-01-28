import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../../../api/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  sessionToken: string | null;
  lastActivity: number;
  pin: string | null;
  biometricEnabled: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setRequiresTwoFactor: (requires: boolean, sessionToken?: string) => void;
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
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      requiresTwoFactor: false,
      sessionToken: null,
      lastActivity: Date.now(),
      pin: null,
      biometricEnabled: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          lastActivity: Date.now(),
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          requiresTwoFactor: false,
          sessionToken: null,
          lastActivity: Date.now(),
        }),

      setRequiresTwoFactor: (requires, sessionToken) =>
        set({
          requiresTwoFactor: requires,
          sessionToken: sessionToken || null,
        }),

      setPin: (pin) => set({ pin }),

      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),

      updateLastActivity: () => set({ lastActivity: Date.now() }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          requiresTwoFactor: false,
          sessionToken: null,
          lastActivity: Date.now(),
        }),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          requiresTwoFactor: false,
          sessionToken: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        pin: state.pin,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
);
