import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | 'lab_technician';
  permissions: string[];
  laboratoryId?: string;
  avatar?: string;
  createdAt: string;
}

// Sender type for V3 API
export interface SelectedSender {
  Id: number;
  Firstname?: string;
  Lastname?: string;
  LaboratoryId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  tempToken: string | null; // For 2FA flow
  username: string | null; // Store username for 2FA verification
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  passwordExpired: boolean;
  lastActivity: number;
  pin: string | null;
  biometricEnabled: boolean;
  selectedSender: SelectedSender | null; // Selected sender for V3 API calls

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setTempToken: (tempToken: string, username: string) => void;
  setRequiresTwoFactor: (requires: boolean) => void;
  setPasswordExpired: (expired: boolean) => void;
  setPin: (pin: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setSelectedSender: (sender: SelectedSender | null) => void;
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
      tempToken: null,
      username: null,
      isAuthenticated: false,
      requiresTwoFactor: false,
      passwordExpired: false,
      lastActivity: Date.now(),
      pin: null,
      biometricEnabled: false,
      selectedSender: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          lastActivity: Date.now(),
        }),

      setToken: (token) =>
        set({
          token,
          tempToken: null,
          isAuthenticated: true,
          requiresTwoFactor: false,
          lastActivity: Date.now(),
        }),

      setTempToken: (tempToken, username) =>
        set({
          tempToken,
          username,
          requiresTwoFactor: true,
          isAuthenticated: false,
        }),

      setRequiresTwoFactor: (requires) =>
        set({
          requiresTwoFactor: requires,
        }),

      setPasswordExpired: (expired) =>
        set({
          passwordExpired: expired,
        }),

      setPin: (pin) => set({ pin }),

      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),

      setSelectedSender: (sender) => set({ selectedSender: sender }),

      updateLastActivity: () => set({ lastActivity: Date.now() }),

      logout: () =>
        set({
          user: null,
          token: null,
          tempToken: null,
          username: null,
          isAuthenticated: false,
          requiresTwoFactor: false,
          passwordExpired: false,
          lastActivity: Date.now(),
          selectedSender: null,
        }),

      clearSession: () =>
        set({
          token: null,
          tempToken: null,
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
        pin: state.pin,
        biometricEnabled: state.biometricEnabled,
        selectedSender: state.selectedSender,
      }),
    }
  )
);
