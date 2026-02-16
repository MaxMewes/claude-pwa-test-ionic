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
  IonIcon,
} from '@ionic/react';
import { fingerPrint } from 'ionicons/icons';
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
        <div className="login-container">
          {/* Logo and Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '24px' }}>
            <img
              src="/assets/images/login-undraw-hire.svg"
              alt="labGate"
              style={{
                width: '260px',
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
          <form onSubmit={handleSubmit(onSubmit)} className="login-form" aria-label={t('auth.login')}>
            <div>
              <IonList>
                <IonItem className={errors.username ? 'ion-invalid' : ''}>
                  <IonLabel position="stacked">{t('auth.username')}</IonLabel>
                  <IonInput
                    type="text"
                    placeholder={t('auth.usernamePlaceholder')}
                    {...register('username')}
                    onIonInput={(e) => setValue('username', e.detail.value || '')}
                    aria-invalid={errors.username ? 'true' : 'false'}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                  />
                  {errors.username && (
                    <div id="username-error" slot="error" role="alert" style={{ color: 'var(--ion-color-danger)', fontSize: '12px', padding: '4px 0' }}>
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

              {/* Mobile only: Links right below password field */}
              <div className="login-links-mobile">
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => router.push(ROUTES.RESET_PASSWORD)}
                >
                  {t('auth.forgotPassword')}
                </IonButton>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => router.push(ROUTES.REGISTER)}
                >
                  {t('auth.register')}
                </IonButton>
              </div>

              {/* Error Message */}
              {loginError && (
                <IonText color="danger">
                  <p
                    role="alert"
                    style={{ textAlign: 'center', marginTop: '16px' }}
                  >
                    {t('auth.invalidCredentials')}
                  </p>
                </IonText>
              )}
            </div>

            {/* Spacer to push buttons to bottom on mobile */}
            <div className="login-spacer" />

            {/* Buttons at bottom */}
            <div style={{ paddingBottom: '16px' }}>
              {/* Fingerprint icon - mobile only */}
              <div className="fingerprint-mobile-only" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <IonIcon
                  icon={fingerPrint}
                  style={{
                    fontSize: '48px',
                    color: 'var(--labgate-brand, #4E8B3B)',
                  }}
                />
              </div>

              {/* Submit Button */}
              <IonButton
                type="submit"
                expand="block"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <IonSpinner name="crescent" /> : t('auth.login')}
              </IonButton>

              {/* Desktop only: Links below login button */}
              <div className="login-links-desktop">
                <IonButton
                  fill="clear"
                  expand="block"
                  style={{ marginTop: '8px' }}
                  onClick={() => router.push(ROUTES.RESET_PASSWORD)}
                >
                  {t('auth.forgotPassword')}
                </IonButton>
                <IonButton
                  fill="clear"
                  expand="block"
                  onClick={() => router.push(ROUTES.REGISTER)}
                >
                  {t('auth.register')}
                </IonButton>
              </div>
            </div>
          </form>

        </div>
      </IonContent>
    </IonPage>
  );
};
