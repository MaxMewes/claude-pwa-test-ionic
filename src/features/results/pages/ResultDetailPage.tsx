import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useResult } from '../hooks/useResults';
import { useSettingsStore } from '../../../shared/store/useSettingsStore';
import { TestResultList } from '../components/TestResultList';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

export const ResultDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: result, isLoading } = useResult(id);
  const { isFavorite, toggleFavorite } = useSettingsStore();

  // Check if this result is a favorite (from local storage)
  const isResultFavorite = result?.Id ? isFavorite(result.Id) : false;

  const handleToggleFavorite = () => {
    if (result?.Id) {
      toggleFavorite(result.Id);
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.RESULTS} />
            </IonButtons>
            <IonTitle>{t('results.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="detail" />
        </IonContent>
      </IonPage>
    );
  }

  if (!result) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.RESULTS} />
            </IonButtons>
            <IonTitle>{t('results.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="medium">Befund nicht gefunden</IonText>
        </IonContent>
      </IonPage>
    );
  }

  // labGate API v3 uses ResultData instead of tests
  const tests = result.ResultData || [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.RESULTS} />
          </IonButtons>
          {/* labGate API v3 uses Patient with Firstname/Lastname or Fullname */}
          <IonTitle>{result.Patient?.Fullname || `${result.Patient?.Firstname || ''} ${result.Patient?.Lastname || ''}`.trim() || 'Patient'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleToggleFavorite}>
              <IonIcon
                icon={isResultFavorite ? star : starOutline}
                style={{ color: isResultFavorite ? '#E18B05' : undefined }}
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Result Info Header - like old app */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #E5E5E5',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <IonText style={{ fontSize: '12px', color: '#646363' }}>
                {t('results.reportDate')}
              </IonText>
              <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: '#3C3C3B' }}>
                {format(new Date(result.ReportDate), 'dd.MM.yyyy HH:mm', { locale: de })}
              </p>
            </div>
            <div>
              <IonText style={{ fontSize: '12px', color: '#646363' }}>
                Labor-Nr.
              </IonText>
              <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: '#3C3C3B' }}>
                {result.LabNo}
              </p>
            </div>
            {result.Laboratory?.Name && (
              <div>
                <IonText style={{ fontSize: '12px', color: '#646363' }}>
                  Labor
                </IonText>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: '#3C3C3B' }}>
                  {result.Laboratory.Name}
                </p>
              </div>
            )}
            {result.Sender?.Name && (
              <div>
                <IonText style={{ fontSize: '12px', color: '#646363' }}>
                  Einsender
                </IonText>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: '#3C3C3B' }}>
                  {result.Sender.Name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test Results List - like old app */}
        <TestResultList tests={tests} />
      </IonContent>
    </IonPage>
  );
};
