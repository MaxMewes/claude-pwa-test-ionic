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
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useResult } from '../hooks/useResults';
import { useSettingsStore } from '../../../shared/store/useSettingsStore';
import { TestResultList } from '../components/TestResultList';
import { CumulativeResultsView } from '../components/CumulativeResultsView';
import { TrendChart } from '../components/TrendChart';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

type DetailViewTab = 'result' | 'cumulative' | 'trend';

export const ResultDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: result, isLoading } = useResult(id);
  const { isFavorite, toggleFavorite } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<DetailViewTab>('result');
  const [selectedTestIdent, setSelectedTestIdent] = useState<string | undefined>();

  // Check if this result is a favorite (from local storage)
  const isResultFavorite = result?.Id ? isFavorite(result.Id) : false;

  const handleToggleFavorite = () => {
    if (result?.Id) {
      toggleFavorite(result.Id);
    }
  };

  // Handle test click from cumulative view to show trend
  const handleTestClick = (testIdent: string) => {
    setSelectedTestIdent(testIdent);
    setActiveTab('trend');
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
  const patientId = result.Patient?.Id;

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

        {/* View Switcher Tabs */}
        <IonToolbar>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as DetailViewTab)}
          >
            <IonSegmentButton value="result">
              <IonLabel>{t('resultDetail.tabs.result')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="cumulative">
              <IonLabel>{t('resultDetail.tabs.cumulative')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="trend">
              <IonLabel>{t('resultDetail.tabs.trend')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Result Info Header - shown for result and cumulative tabs */}
        {(activeTab === 'result' || activeTab === 'cumulative') && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--ion-background-color, #FAFAFA)',
              borderBottom: '1px solid var(--labgate-border, #E5E5E5)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted, #646363)' }}>
                  {t('results.reportDate')}
                </IonText>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text, #3C3C3B)' }}>
                  {format(new Date(result.ReportDate), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              </div>
              <div>
                <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted, #646363)' }}>
                  Labor-Nr.
                </IonText>
                <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text, #3C3C3B)' }}>
                  {result.LabNo}
                </p>
              </div>
              {result.Laboratory?.Name && (
                <div>
                  <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted, #646363)' }}>
                    Labor
                  </IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text, #3C3C3B)' }}>
                    {result.Laboratory.Name}
                  </p>
                </div>
              )}
              {result.Sender?.Name && (
                <div>
                  <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted, #646363)' }}>
                    Einsender
                  </IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500, fontSize: '14px', color: 'var(--labgate-text, #3C3C3B)' }}>
                    {result.Sender.Name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'result' && (
          <TestResultList tests={tests} />
        )}

        {activeTab === 'cumulative' && patientId && (
          <CumulativeResultsView
            patientId={patientId}
            onTestClick={handleTestClick}
          />
        )}

        {activeTab === 'cumulative' && !patientId && (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <IonText color="medium">{t('cumulativeResults.noData')}</IonText>
          </div>
        )}

        {activeTab === 'trend' && patientId && (
          <TrendChart
            patientId={patientId}
            initialTestIdent={selectedTestIdent}
          />
        )}

        {activeTab === 'trend' && !patientId && (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <IonText color="medium">{t('trendChart.noData')}</IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};
