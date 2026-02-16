import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../../../shared/store/useSettingsStore';
import { authService, LoginCredentials } from '../../../api/services/authService';
import { ROUTES } from '../../../config/routes';

export function useAuth() {
  const router = useIonRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    requiresTwoFactor,
    tempToken,
    username,
    setUser,
    setToken,
    setTempToken,
    setPasswordExpired,
    logout: storeLogout,
  } = useAuthStore();
  const { reset: resetSettings } = useSettingsStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      if (data.requiresTwoFactor && data.tempToken) {
        // Store tempToken and username for 2FA verification
        setTempToken(data.tempToken, data.user.username || '');
        router.push(ROUTES.TWO_FACTOR, 'forward', 'replace');
      } else if (data.token) {
        // Clear stale cache before setting new session
        queryClient.clear();
        // Login successful without 2FA
        setUser(data.user);
        setToken(data.token);
        if (data.passwordExpired) {
          setPasswordExpired(true);
        }
        router.push(ROUTES.RESULTS, 'forward', 'replace');
      }
    },
  });

  const twoFactorMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!tempToken || !username) {
        throw new Error('Missing tempToken or username for 2FA');
      }
      return authService.verifyTwoFactor(code, username, tempToken);
    },
    onSuccess: (data) => {
      // Clear stale cache before setting new session
      queryClient.clear();
      setUser(data.user);
      setToken(data.token);
      router.push(ROUTES.RESULTS, 'forward', 'replace');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSettled: () => {
      // Clear auth state
      storeLogout();
      // Clear settings store (favorites, preview mode, etc.)
      resetSettings();
      // Clear all cached queries
      queryClient.clear();
      router.push(ROUTES.LOGIN, 'back', 'replace');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      await authService.changePassword(oldPassword, newPassword);
    },
  });

  const login = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials);
  };

  const verifyTwoFactor = (code: string) => {
    twoFactorMutation.mutate(code);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    return changePasswordMutation.mutateAsync({ oldPassword, newPassword });
  };

  return {
    user,
    isAuthenticated,
    requiresTwoFactor,
    login,
    verifyTwoFactor,
    logout,
    changePassword,
    isLoggingIn: loginMutation.isPending,
    isVerifying: twoFactorMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    loginError: loginMutation.error,
    twoFactorError: twoFactorMutation.error,
    changePasswordError: changePasswordMutation.error,
  };
}
