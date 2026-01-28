import React, { useState, useEffect } from 'react';
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonText,
  IonModal,
} from '@ionic/react';
import { pinOutline, pin, documentOutline, statsChartOutline, listOutline, star, starOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useResult, useMarkResultAsRead, useToggleResultPin } from '../hooks/useResults';
import { CumulativeView } from '../components/CumulativeView';
import { TrendChart } from '../components/TrendChart';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';
import { TestResult } from '../../../api/types';

type ViewMode = 'cumulative' | 'trend';

export const ResultDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  // labGate API v3 uses numeric Id
  const { data: result, isLoading } = useResult(id);
  const markAsRead = useMarkResultAsRead();
  const togglePin = useToggleResultPin();

  const [viewMode, setViewMode] = useState<ViewMode>('cumulative');
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  // Mark as read when viewing - labGate API v3 uses IsRead and Id
  useEffect(() => {
    if (result && !result.IsRead) {
      markAsRead.mutate([result.Id]);
    }
  }, [result?.Id]);

  const handleTogglePin = () => {
    if (result) {
      togglePin.mutate(result.Id);
    }
  };

  const handleTestClick = (test: TestResult) => {
    setSelectedTest(test);
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
          {/* labGate API v3 uses Patient.Fullname */}
          <IonTitle>{result.Patient.Fullname}</IonTitle>
          <IonButtons slot="end">
            {result.IsFavorite && (
              <IonButton>
                <IonIcon icon={star} color="warning" />
              </IonButton>
            )}
            <IonButton onClick={handleTogglePin}>
              <IonIcon icon={result.isPinned ? pin : pinOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Result Info Card */}
        <IonCard>
          <IonCardContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <IonText color="medium" style={{ fontSize: '12px' }}>
                  {t('results.reportDate')}
                </IonText>
                <IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>
                    {/* labGate API v3 uses ReportDate */}
                    {format(new Date(result.ReportDate), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                </IonText>
              </div>
              <div>
                <IonText color="medium" style={{ fontSize: '12px' }}>
                  Labor
                </IonText>
                <IonText>
                  {/* labGate API v3 uses Laboratory?.Name */}
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{result.Laboratory?.Name || '-'}</p>
                </IonText>
              </div>
              <div>
                <IonText color="medium" style={{ fontSize: '12px' }}>
                  Labor-Nr.
                </IonText>
                <IonText>
                  {/* labGate API v3 uses LabNo */}
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>#{result.LabNo}</p>
                </IonText>
              </div>
              {result.LaboratorySection && (
                <div>
                  <IonText color="medium" style={{ fontSize: '12px' }}>
                    Bereich
                  </IonText>
                  <IonText>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{result.LaboratorySection}</p>
                  </IonText>
                </div>
              )}
              {result.Sender && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <IonText color="medium" style={{ fontSize: '12px' }}>
                    Einsender
                  </IonText>
                  <IonText>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{result.Sender.Name}</p>
                  </IonText>
                </div>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        {/* View Mode Segment */}
        <div style={{ padding: '0 16px' }}>
          <IonSegment value={viewMode} onIonChange={(e) => setViewMode(e.detail.value as ViewMode)}>
            <IonSegmentButton value="cumulative">
              <IonIcon icon={listOutline} />
              <IonLabel>{t('results.cumulative')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="trend">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>{t('results.trend')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'cumulative' ? (
          <CumulativeView tests={tests} onTestClick={handleTestClick} />
        ) : (
          <div style={{ padding: '16px' }}>
            {tests.map((test) => (
              <TrendChart key={test.Id} resultId={result.Id} test={test} />
            ))}
          </div>
        )}

        {/* Test Detail Modal */}
        <IonModal
          isOpen={!!selectedTest}
          onDidDismiss={() => setSelectedTest(null)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5, 0.75, 1]}
        >
          {selectedTest && (
            <IonContent className="ion-padding">
              <TrendChart resultId={result.Id} test={selectedTest} />
            </IonContent>
          )}
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
