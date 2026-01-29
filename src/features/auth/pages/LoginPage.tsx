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

// labGate API v3 uses Username instead of email
const loginSchema = z.object({
  username: z.string().min(1, 'Bitte geben Sie Ihren Benutzernamen ein'),
  password: z.string().min(1, 'Bitte geben Sie Ihr Passwort ein'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
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
          {/* Logo and Title - Modern Design */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                background: 'linear-gradient(135deg, #70CC60 0%, #5cb84e 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(112, 204, 96, 0.35)',
                position: 'relative',
              }}
            >
              <span style={{
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-1px'
              }}>
                LG
              </span>
              {/* Subtle shine effect */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '50%',
                bottom: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
                borderRadius: '16px 8px 24px 8px',
              }} />
            </div>
            <h1 style={{
              margin: '0 0 6px 0',
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--labgate-text)',
              letterSpacing: '-0.5px'
            }}>
              labGate
            </h1>
            <p style={{
              margin: 0,
              color: 'var(--labgate-text-muted)',
              fontSize: '15px',
              fontWeight: 500
            }}>
              Medizinische Laborbefunde
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonList>
              <IonItem className={errors.username ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.username')}</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Benutzername"
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
