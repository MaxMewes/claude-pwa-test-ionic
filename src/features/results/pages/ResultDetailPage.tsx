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
import { pinOutline, pin, documentOutline, statsChartOutline, listOutline } from 'ionicons/icons';
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
  const { data: result, isLoading } = useResult(id);
  const markAsRead = useMarkResultAsRead();
  const togglePin = useToggleResultPin();

  const [viewMode, setViewMode] = useState<ViewMode>('cumulative');
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  // Mark as read when viewing
  useEffect(() => {
    if (result && !result.isRead) {
      markAsRead.mutate(result.id);
    }
  }, [result?.id]);

  const handleTogglePin = () => {
    if (result) {
      togglePin.mutate(result.id);
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.RESULTS} />
          </IonButtons>
          <IonTitle>{result.patientName}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleTogglePin}>
              <IonIcon icon={result.isPinned ? pin : pinOutline} />
            </IonButton>
            {result.pdfUrl && (
              <IonButton>
                <IonIcon icon={documentOutline} />
              </IonButton>
            )}
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
                  {t('results.collectionDate')}
                </IonText>
                <IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>
                    {format(new Date(result.collectionDate), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                </IonText>
              </div>
              <div>
                <IonText color="medium" style={{ fontSize: '12px' }}>
                  {t('results.reportDate')}
                </IonText>
                <IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>
                    {format(new Date(result.reportDate), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                </IonText>
              </div>
              <div>
                <IonText color="medium" style={{ fontSize: '12px' }}>
                  Labor
                </IonText>
                <IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>{result.laboratoryName}</p>
                </IonText>
              </div>
              <div>
                <IonText color="medium" style={{ fontSize: '12px' }}>
                  {t('results.orderNumber')}
                </IonText>
                <IonText>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 500 }}>#{result.orderNumber}</p>
                </IonText>
              </div>
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
          <CumulativeView tests={result.tests} onTestClick={handleTestClick} />
        ) : (
          <div style={{ padding: '16px' }}>
            {result.tests.map((test) => (
              <TrendChart key={test.id} resultId={result.id} test={test} />
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
              <TrendChart resultId={result.id} test={selectedTest} />
            </IonContent>
          )}
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
