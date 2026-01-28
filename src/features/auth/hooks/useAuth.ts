import { useMutation } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { LoginRequest, LoginResponse, TwoFactorRequest, TwoFactorResponse } from '../../../api/types';
import { ROUTES } from '../../../config/routes';

export function useAuth() {
  const router = useIonRouter();
  const {
    user,
    isAuthenticated,
    requiresTwoFactor,
    sessionToken,
    setUser,
    setTokens,
    setRequiresTwoFactor,
    logout: storeLogout,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true, 'session-token');
        router.push(ROUTES.TWO_FACTOR, 'forward', 'replace');
      } else {
        setTokens(data.accessToken, data.refreshToken);
        router.push(ROUTES.RESULTS, 'forward', 'replace');
      }
    },
  });

  const twoFactorMutation = useMutation({
    mutationFn: async (request: TwoFactorRequest) => {
      const response = await axiosInstance.post<TwoFactorResponse>('/auth/two-factor', request);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      router.push(ROUTES.RESULTS, 'forward', 'replace');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/auth/logout');
    },
    onSettled: () => {
      storeLogout();
      router.push(ROUTES.LOGIN, 'back', 'replace');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axiosInstance.post('/auth/change-password', data);
      return response.data;
    },
  });

  const login = (credentials: LoginRequest) => {
    loginMutation.mutate(credentials);
  };

  const verifyTwoFactor = (code: string) => {
    twoFactorMutation.mutate({ code, sessionToken: sessionToken || '' });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    return changePasswordMutation.mutateAsync({ currentPassword, newPassword });
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
