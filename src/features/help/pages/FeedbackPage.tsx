import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
  useIonToast,
} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { FeedbackRequest, FeedbackResponse, FeedbackType } from '../../../api/types';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'question', 'other']),
  subject: z.string().min(3, 'Betreff muss mindestens 3 Zeichen lang sein'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
  email: z.string().email('Bitte geben Sie eine gueltige E-Mail-Adresse ein').optional().or(z.literal('')),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export const FeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'question',
      subject: '',
      message: '',
      email: '',
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackRequest) => {
      const response = await axiosInstance.post<FeedbackResponse>('/feedbacks', data);
      return response.data;
    },
    onSuccess: (data) => {
      presentToast({
        message: data.message,
        duration: 3000,
        color: 'success',
      });
      reset();
      router.goBack();
    },
    onError: () => {
      presentToast({
        message: t('errors.generic'),
        duration: 3000,
        color: 'danger',
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    feedbackMutation.mutate({
      type: data.type as FeedbackType,
      subject: data.subject,
      message: data.message,
      email: data.email || undefined,
    });
  };

  const feedbackTypes = [
    { value: 'bug', label: t('help.feedbackTypes.bug') },
    { value: 'feature', label: t('help.feedbackTypes.feature') },
    { value: 'question', label: t('help.feedbackTypes.question') },
    { value: 'other', label: t('help.feedbackTypes.other') },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/help" />
          </IonButtons>
          <IonTitle>{t('help.feedback')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonText color="medium">
          <p style={{ marginTop: 0 }}>{t('help.feedbackDescription')}</p>
        </IonText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">{t('help.feedbackType')}</IonLabel>
              <IonSelect
                value={watch('type')}
                onIonChange={(e) => setValue('type', e.detail.value)}
                interface="action-sheet"
              >
                {feedbackTypes.map((type) => (
                  <IonSelectOption key={type.value} value={type.value}>
                    {type.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className={errors.subject ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">{t('help.subject')}</IonLabel>
              <IonInput
                placeholder={t('help.subjectPlaceholder')}
                {...register('subject')}
                onIonInput={(e) => setValue('subject', e.detail.value || '')}
              />
              {errors.subject && (
                <IonText color="danger" style={{ fontSize: '12px', padding: '4px 0' }}>
                  {errors.subject.message}
                </IonText>
              )}
            </IonItem>

            <IonItem className={errors.message ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">{t('help.message')}</IonLabel>
              <IonTextarea
                placeholder={t('help.messagePlaceholder')}
                rows={6}
                {...register('message')}
                onIonInput={(e) => setValue('message', e.detail.value || '')}
              />
              {errors.message && (
                <IonText color="danger" style={{ fontSize: '12px', padding: '4px 0' }}>
                  {errors.message.message}
                </IonText>
              )}
            </IonItem>

            <IonItem className={errors.email ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">{t('help.emailOptional')}</IonLabel>
              <IonInput
                type="email"
                placeholder={t('help.emailPlaceholder')}
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

          <IonButton
            type="submit"
            expand="block"
            style={{ marginTop: '24px' }}
            disabled={feedbackMutation.isPending}
          >
            {feedbackMutation.isPending ? <IonSpinner name="crescent" /> : t('help.sendFeedback')}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};
