import React from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonSpinner,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
} from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { PasswordInput } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';
import { useIonRouter } from '@ionic/react';

type LoginFormData = {
  username: string;
  password: string;
};

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();

  // labGate API v3 uses Username instead of email
  const loginSchema = z.object({
    username: z.string().min(1, t('auth.usernameRequired')),
    password: z.string().min(1, t('auth.passwordRequired')),
  });
  const router = useIonRouter();
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const password = watch('password');

  const onSubmit = (data: LoginFormData) => {
    // authService handles the API format conversion
    login({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100%',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {/* Logo and Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <img
              src="/assets/images/login-undraw-hire.svg"
              alt="labGate"
              style={{
                width: '200px',
                height: 'auto',
                margin: '0 auto 20px',
                display: 'block',
              }}
            />
            <p style={{
              margin: 0,
              color: 'var(--labgate-text-muted)',
              fontSize: '15px',
              fontWeight: 500
            }}>
              {t('auth.subtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonList>
              <IonItem className={errors.username ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.username')}</IonLabel>
                <IonInput
                  type="text"
                  placeholder={t('auth.usernamePlaceholder')}
                  {...register('username')}
                  onIonInput={(e) => setValue('username', e.detail.value || '')}
                />
                {errors.username && (
                  <div slot="error" style={{ color: 'var(--ion-color-danger)', fontSize: '12px', padding: '4px 0' }}>
                    {errors.username.message}
                  </div>
                )}
              </IonItem>

              <PasswordInput
                label={t('auth.password')}
                value={password}
                placeholder={t('auth.password')}
                onChange={(value) => setValue('password', value)}
                error={errors.password?.message}
              />
            </IonList>

            {/* Error Message */}
            {loginError && (
              <IonText color="danger">
                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                  {t('auth.invalidCredentials')}
                </p>
              </IonText>
            )}

            {/* Submit Button */}
            <IonButton
              type="submit"
              expand="block"
              style={{ marginTop: '24px' }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? <IonSpinner name="crescent" /> : t('auth.login')}
            </IonButton>

            {/* Forgot Password Link */}
            <IonButton
              fill="clear"
              expand="block"
              style={{ marginTop: '8px' }}
              onClick={() => router.push(ROUTES.RESET_PASSWORD)}
            >
              {t('auth.forgotPassword')}
            </IonButton>

            {/* Register Link */}
            <IonButton
              fill="clear"
              expand="block"
              onClick={() => router.push(ROUTES.REGISTER)}
            >
              {t('auth.register')}
            </IonButton>
          </form>

        </div>
      </IonContent>
    </IonPage>
  );
};
