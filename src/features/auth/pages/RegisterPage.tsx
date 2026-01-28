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
  useIonToast,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { RegisterRequest, RegisterResponse } from '../../../api/types';
import { PasswordInput } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte geben Sie eine gueltige E-Mail-Adresse ein'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwoerter stimmen nicht ueberein',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      presentToast({
        message: data.message,
        duration: 4000,
        color: 'success',
      });
      router.push(ROUTES.LOGIN, 'back', 'replace');
    },
    onError: (error: any) => {
      presentToast({
        message: error.response?.data?.message || t('errors.generic'),
        duration: 3000,
        color: 'danger',
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
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
          {/* Back Button */}
          <IonButton
            fill="clear"
            onClick={() => router.push(ROUTES.LOGIN, 'back', 'replace')}
            style={{ alignSelf: 'flex-start', marginBottom: '16px' }}
          >
            <IonIcon icon={arrowBackOutline} slot="start" />
            {t('common.back')}
          </IonButton>

          {/* Title */}
          <div style={{ marginBottom: '32px' }}>
            <IonText color="dark">
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{t('auth.register')}</h1>
            </IonText>
            <IonText color="medium">
              <p style={{ margin: 0 }}>{t('auth.registerDescription')}</p>
            </IonText>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonList>
              <IonItem className={errors.firstName ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.firstName')}</IonLabel>
                <IonInput
                  type="text"
                  {...register('firstName')}
                  onIonInput={(e) => setValue('firstName', e.detail.value || '')}
                />
                {errors.firstName && (
                  <IonText color="danger" style={{ fontSize: '12px', padding: '4px 0' }}>
                    {errors.firstName.message}
                  </IonText>
                )}
              </IonItem>

              <IonItem className={errors.lastName ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.lastName')}</IonLabel>
                <IonInput
                  type="text"
                  {...register('lastName')}
                  onIonInput={(e) => setValue('lastName', e.detail.value || '')}
                />
                {errors.lastName && (
                  <IonText color="danger" style={{ fontSize: '12px', padding: '4px 0' }}>
                    {errors.lastName.message}
                  </IonText>
                )}
              </IonItem>

              <IonItem className={errors.email ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.email')}</IonLabel>
                <IonInput
                  type="email"
                  placeholder="name@example.de"
                  {...register('email')}
                  onIonInput={(e) => setValue('email', e.detail.value || '')}
                />
                {errors.email && (
                  <IonText color="danger" style={{ fontSize: '12px', padding: '4px 0' }}>
                    {errors.email.message}
                  </IonText>
                )}
              </IonItem>

              <PasswordInput
                label={t('auth.password')}
                value={password}
                onChange={(value) => setValue('password', value)}
                error={errors.password?.message}
              />

              <PasswordInput
                label={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(value) => setValue('confirmPassword', value)}
                error={errors.confirmPassword?.message}
              />
            </IonList>

            {/* Submit Button */}
            <IonButton
              type="submit"
              expand="block"
              style={{ marginTop: '24px' }}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <IonSpinner name="crescent" /> : t('auth.register')}
            </IonButton>

            {/* Login Link */}
            <IonButton
              fill="clear"
              expand="block"
              onClick={() => router.push(ROUTES.LOGIN, 'back', 'replace')}
              style={{ marginTop: '8px' }}
            >
              {t('auth.alreadyHaveAccount')}
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};
