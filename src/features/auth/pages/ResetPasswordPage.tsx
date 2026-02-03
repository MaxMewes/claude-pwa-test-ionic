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
import { arrowBackOutline, mailOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { ResetPasswordRequest, ResetPasswordResponse } from '../../../api/types';
import { ROUTES } from '../../../config/routes';

const resetPasswordSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gueltige E-Mail-Adresse ein'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      // labGate API v3 endpoint
      const response = await axiosInstance.post<ResetPasswordResponse>('/api/v3/authentication/reset-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      presentToast({
        message: data.message,
        duration: 5000,
        color: 'success',
      });
      router.push(ROUTES.LOGIN, 'back', 'replace');
    },
    onError: () => {
      presentToast({
        message: t('errors.generic'),
        duration: 3000,
        color: 'danger',
      });
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    // labGate API v3 format - uses Username and Email
    resetMutation.mutate({
      Username: data.email, // Use email as username
      Email: data.email,
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

          {/* Icon and Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--ion-color-primary-tint)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <IonIcon icon={mailOutline} style={{ fontSize: '28px', color: 'var(--ion-color-primary)' }} />
            </div>
            <IonText color="dark">
              <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{t('auth.resetPassword')}</h1>
            </IonText>
            <IonText color="medium">
              <p style={{ margin: 0 }}>{t('auth.resetPasswordDescription')}</p>
            </IonText>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonList>
              <IonItem className={errors.email ? 'ion-invalid' : ''}>
                <IonLabel position="stacked">{t('auth.email')}</IonLabel>
                <IonInput
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  {...register('email')}
                  onIonInput={(e) => setValue('email', e.detail.value || '')}
                />
                {errors.email && (
                  <IonText color="danger" style={{ fontSize: '12px', padding: '4px 0' }}>
                    {errors.email.message}
                  </IonText>
                )}
              </IonItem>
            </IonList>

            {/* Submit Button */}
            <IonButton
              type="submit"
              expand="block"
              style={{ marginTop: '24px' }}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? <IonSpinner name="crescent" /> : t('auth.sendResetLink')}
            </IonButton>

            {/* Back to Login */}
            <IonButton
              fill="clear"
              expand="block"
              onClick={() => router.push(ROUTES.LOGIN, 'back', 'replace')}
              style={{ marginTop: '8px' }}
            >
              {t('auth.backToLogin')}
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};
