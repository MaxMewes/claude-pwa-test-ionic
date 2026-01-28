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

const loginSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gueltige E-Mail-Adresse ein'),
  password: z.string().min(1, 'Bitte geben Sie Ihr Passwort ein'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
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
      email: '',
      password: '',
    },
  });

  const password = watch('password');

  const onSubmit = (data: LoginFormData) => {
    login(data);
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
          {/* Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--ion-color-primary)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <span style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>LG</span>
            </div>
            <IonText color="dark">
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>labGate</h1>
            </IonText>
            <IonText color="medium">
              <p style={{ margin: 0 }}>Medizinische Laborbefunde</p>
            </IonText>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonList>
              <IonItem className={errors.email ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.email')}</IonLabel>
                <IonInput
                  type="email"
                  placeholder="name@example.de"
                  {...register('email')}
                  onIonInput={(e) => setValue('email', e.detail.value || '')}
                />
                {errors.email && (
                  <div slot="error" style={{ color: 'var(--ion-color-danger)', fontSize: '12px', padding: '4px 0' }}>
                    {errors.email.message}
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
            <IonButton fill="clear" expand="block" style={{ marginTop: '8px' }}>
              {t('auth.forgotPassword')}
            </IonButton>
          </form>

          {/* Demo Credentials */}
          <div
            style={{
              marginTop: '48px',
              padding: '16px',
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '8px',
            }}
          >
            <IonText color="medium">
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>
                Demo-Zugangsdaten:
              </p>
              <p style={{ margin: 0, fontSize: '12px' }}>
                E-Mail: demo@labgate.de<br />
                Passwort: demo123<br />
                2FA-Code: 123456
              </p>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
