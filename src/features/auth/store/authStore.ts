/**
 * Authentication Store using Zustand
 * Manages user authentication state with optimized localStorage updates.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../../../api/types/auth';

// Re-export User for backward compatibility
export type { User };

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

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setTempToken: (tempToken: string, username: string) => void;
  setRequiresTwoFactor: (requires: boolean) => void;
  setPasswordExpired: (expired: boolean) => void;
  setPin: (pin: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  updateLastActivity: () => void;
  logout: () => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'labgate-auth';

const LAST_ACTIVITY_DEBOUNCE_MS = 60000; // Only update lastActivity once per minute

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      // Debounced update to reduce localStorage writes
      updateLastActivity: () => {
        const now = Date.now();
        const current = get().lastActivity;
        
        // Only update if more than 1 minute has passed
        if (now - current < LAST_ACTIVITY_DEBOUNCE_MS) {
          return;
        }
        
        // Update immediately (no additional debounce timer needed)
        set({ lastActivity: now });
      },

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
      // Use sessionStorage for enhanced security - tokens cleared when browser closes
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pin: state.pin,
        biometricEnabled: state.biometricEnabled,
        // Exclude lastActivity from persistence to reduce writes
      }),
    }
  )
);
