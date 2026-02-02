import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('initial state', () => {
    it('should have null user by default', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.user).toBeNull();
    });

    it('should have null token by default', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.token).toBeNull();
    });

    it('should not be authenticated by default', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should not require two factor by default', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.requiresTwoFactor).toBe(false);
    });

    it('should not have password expired by default', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.passwordExpired).toBe(false);
    });

    it('should not have biometric enabled by default', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.biometricEnabled).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'doctor' as const,
        permissions: ['view_results'],
        createdAt: '2024-01-01',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update lastActivity when setting user', () => {
      const { result } = renderHook(() => useAuthStore());
      const beforeTime = Date.now();

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'doctor' as const,
        permissions: [],
        createdAt: '2024-01-01',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.lastActivity).toBeGreaterThanOrEqual(beforeTime);
    });

    it('should set isAuthenticated to false when user is null', () => {
      const { result } = renderHook(() => useAuthStore());

      // First set a user
      act(() => {
        result.current.setUser({
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'doctor' as const,
          permissions: [],
          createdAt: '2024-01-01',
        });
      });

      // Then set to null
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setToken', () => {
    it('should set token and mark as authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setToken('test-token-123');
      });

      expect(result.current.token).toBe('test-token-123');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear tempToken when setting token', () => {
      const { result } = renderHook(() => useAuthStore());

      // First set a temp token
      act(() => {
        result.current.setTempToken('temp-token', 'testuser');
      });

      // Then set actual token
      act(() => {
        result.current.setToken('real-token');
      });

      expect(result.current.tempToken).toBeNull();
      expect(result.current.token).toBe('real-token');
    });

    it('should clear requiresTwoFactor when setting token', () => {
      const { result } = renderHook(() => useAuthStore());

      // First trigger 2FA requirement
      act(() => {
        result.current.setTempToken('temp-token', 'testuser');
      });

      expect(result.current.requiresTwoFactor).toBe(true);

      // Then complete authentication
      act(() => {
        result.current.setToken('real-token');
      });

      expect(result.current.requiresTwoFactor).toBe(false);
    });
  });

  describe('setTempToken', () => {
    it('should set tempToken and username', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTempToken('temp-token-123', 'testuser');
      });

      expect(result.current.tempToken).toBe('temp-token-123');
      expect(result.current.username).toBe('testuser');
    });

    it('should set requiresTwoFactor to true', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTempToken('temp-token', 'testuser');
      });

      expect(result.current.requiresTwoFactor).toBe(true);
    });

    it('should not set isAuthenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTempToken('temp-token', 'testuser');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setRequiresTwoFactor', () => {
    it('should set requiresTwoFactor flag', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setRequiresTwoFactor(true);
      });

      expect(result.current.requiresTwoFactor).toBe(true);

      act(() => {
        result.current.setRequiresTwoFactor(false);
      });

      expect(result.current.requiresTwoFactor).toBe(false);
    });
  });

  describe('setPasswordExpired', () => {
    it('should set passwordExpired flag', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setPasswordExpired(true);
      });

      expect(result.current.passwordExpired).toBe(true);

      act(() => {
        result.current.setPasswordExpired(false);
      });

      expect(result.current.passwordExpired).toBe(false);
    });
  });

  describe('setPin', () => {
    it('should set PIN', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setPin('1234');
      });

      expect(result.current.pin).toBe('1234');
    });

    it('should clear PIN when set to null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setPin('1234');
      });

      act(() => {
        result.current.setPin(null);
      });

      expect(result.current.pin).toBeNull();
    });
  });

  describe('setBiometricEnabled', () => {
    it('should enable biometric', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setBiometricEnabled(true);
      });

      expect(result.current.biometricEnabled).toBe(true);
    });

    it('should disable biometric', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setBiometricEnabled(true);
      });

      act(() => {
        result.current.setBiometricEnabled(false);
      });

      expect(result.current.biometricEnabled).toBe(false);
    });
  });

  describe('updateLastActivity', () => {
    it('should update lastActivity timestamp', () => {
      const { result } = renderHook(() => useAuthStore());
      const beforeTime = Date.now();

      act(() => {
        result.current.updateLastActivity();
      });

      expect(result.current.lastActivity).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('logout', () => {
    it('should clear all session data', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set up authenticated state
      act(() => {
        result.current.setUser({
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'doctor' as const,
          permissions: [],
          createdAt: '2024-01-01',
        });
        result.current.setToken('test-token');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.tempToken).toBeNull();
      expect(result.current.username).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.requiresTwoFactor).toBe(false);
      expect(result.current.passwordExpired).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('should clear session data but keep user', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'doctor' as const,
        permissions: [],
        createdAt: '2024-01-01',
      };

      // Set up authenticated state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setToken('test-token');
      });

      // Clear session
      act(() => {
        result.current.clearSession();
      });

      expect(result.current.user).toEqual(mockUser); // User preserved
      expect(result.current.token).toBeNull();
      expect(result.current.tempToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.requiresTwoFactor).toBe(false);
    });
  });

  describe('state sharing', () => {
    it('should share state between hook instances', () => {
      const { result: result1 } = renderHook(() => useAuthStore());
      const { result: result2 } = renderHook(() => useAuthStore());

      act(() => {
        result1.current.setToken('shared-token');
      });

      expect(result2.current.token).toBe('shared-token');
      expect(result2.current.isAuthenticated).toBe(true);
    });
  });
});
