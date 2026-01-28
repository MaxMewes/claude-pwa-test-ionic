import { useMutation } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { LoginRequest, LoginResponse, TwoFactorRequest, TwoFactorResponse, ChangePasswordRequest } from '../../../api/types';
import { ROUTES } from '../../../config/routes';

export function useAuth() {
  const router = useIonRouter();
  const {
    user,
    isAuthenticated,
    requiresTwoFactor,
    userPermissions,
    setUser,
    setToken,
    setLoginResponse,
    setRequiresTwoFactor,
    logout: storeLogout,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.post<LoginResponse>('/api/v3/authentication/authorize', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setLoginResponse(data);
      if (data.RequiresSecondFactor) {
        router.push(ROUTES.TWO_FACTOR, 'forward', 'replace');
      } else if (data.Token) {
        router.push(ROUTES.RESULTS, 'forward', 'replace');
      }
    },
  });

  const twoFactorMutation = useMutation({
    mutationFn: async (request: TwoFactorRequest) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.post<TwoFactorResponse>('/api/v3/authentication/authorize2f', request);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setRequiresTwoFactor(false);
        // After 2FA, generate a mock token since the mock API doesn't return one
        setToken('mock-token-after-2fa-' + Date.now());
        router.push(ROUTES.RESULTS, 'forward', 'replace');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/api/v3/authentication/logout');
    },
    onSettled: () => {
      storeLogout();
      router.push(ROUTES.LOGIN, 'back', 'replace');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await axiosInstance.post('/api/v3/authentication/change-password', data);
      return response.data;
    },
  });

  const login = (credentials: LoginRequest) => {
    loginMutation.mutate(credentials);
  };

  const verifyTwoFactor = (code: string) => {
    // labGate API v3 uses TwoFactorCode
    twoFactorMutation.mutate({ TwoFactorCode: code });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    // labGate API v3 uses OldPassword/NewPassword
    return changePasswordMutation.mutateAsync({ OldPassword: oldPassword, NewPassword: newPassword });
  };

  return {
    user,
    isAuthenticated,
    requiresTwoFactor,
    userPermissions,
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
