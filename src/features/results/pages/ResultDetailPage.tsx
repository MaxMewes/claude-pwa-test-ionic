import React, { useState } from 'react';
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
  IonFooter,
} from '@ionic/react';
import { star, starOutline, documentTextOutline, statsChartOutline, documentsOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useResult } from '../hooks/useResults';
import { useSettingsStore } from '../../../shared/store/useSettingsStore';
import { TestResultList } from '../components/TestResultList';
import { CumulativeResultsView } from '../components/CumulativeResultsView';
import { DocumentList } from '../components/DocumentList';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

type DetailViewTab = 'result' | 'cumulative' | 'documents';

export const ResultDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: result, isLoading } = useResult(id);
  const { isFavorite, toggleFavorite } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<DetailViewTab>('result');

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

  const tests = result.ResultData || [];
  const patientId = result.Patient?.Id;

  const tabs: { key: DetailViewTab; label: string; icon: string }[] = [
    { key: 'result', label: t('resultDetail.tabs.result'), icon: documentTextOutline },
    { key: 'cumulative', label: t('resultDetail.tabs.cumulative'), icon: statsChartOutline },
    ...(result.HasDocuments ? [
      { key: 'documents' as DetailViewTab, label: t('resultDetail.tabs.documents'), icon: documentsOutline },
    ] : []),
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.RESULTS} />
          </IonButtons>
          <IonTitle>{result.Patient?.Fullname || `${result.Patient?.Firstname || ''} ${result.Patient?.Lastname || ''}`.trim() || 'Patient'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleToggleFavorite}>
              <IonIcon
                icon={isResultFavorite ? star : starOutline}
                style={{ color: isResultFavorite ? 'var(--labgate-favorite)' : undefined }}
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Result Info Header */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--ion-background-color)',
            borderBottom: '1px solid var(--labgate-border)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted)' }}>
                {t('results.reportDate')}
              </IonText>
              <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text)' }}>
                {format(new Date(result.ReportDate), 'dd.MM.yyyy HH:mm', { locale: de })}
              </p>
            </div>
            <div>
              <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted)' }}>
                Labor-Nr.
              </IonText>
              <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text)' }}>
                {result.LabNo}
              </p>
            </div>
            {result.Laboratory?.Name && (
              <div>
                <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted)' }}>
                  Labor
                </IonText>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text)' }}>
                  {result.Laboratory.Name}
                </p>
              </div>
            )}
            {result.Sender?.Name && (
              <div>
                <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted)' }}>
                  Einsender
                </IonText>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text)' }}>
                  {result.Sender.Name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'result' && (
          <TestResultList tests={tests} patientId={patientId} />
        )}

        {activeTab === 'cumulative' && patientId && (
          <CumulativeResultsView patientId={patientId} />
        )}

        {activeTab === 'cumulative' && !patientId && (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <IonText color="medium">{t('cumulativeResults.noData')}</IonText>
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentList resultId={result.Id} />
        )}
      </IonContent>

      {/* Bottom Tab Navigation */}
      <IonFooter>
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid var(--labgate-border)',
            backgroundColor: 'var(--ion-background-color)',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 4px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? 'var(--labgate-brand)' : 'var(--labgate-text-muted)',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IonIcon icon={tab.icon} style={{ fontSize: '22px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </IonFooter>
    </IonPage>
  );
};
