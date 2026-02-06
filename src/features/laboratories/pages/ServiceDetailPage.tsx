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
  IonIcon,
  IonChip,
} from '@ionic/react';
import { globeOutline, flaskOutline, timeOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServiceDetail } from '../hooks/useLaboratories';
import { SkeletonLoader, EmptyState } from '../../../shared/components';

// Colors using CSS variables for dark mode support
const COLORS = {
  brand: 'var(--labgate-brand)',
  brandText: 'var(--labgate-brand-text-on-brand)',
  text: 'var(--labgate-text)',
  textLight: 'var(--labgate-text-light)',
  border: 'var(--labgate-border)',
  background: 'var(--labgate-row-even)',
};

export const ServiceDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { labId, serviceId } = useParams<{ labId: string; serviceId: string }>();
  const { data: serviceDetail, isLoading, error } = useServiceDetail(
    serviceId ? parseInt(serviceId, 10) : undefined
  );

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={`/laboratories/${labId}`} />
            </IonButtons>
            <IonTitle>{t('laboratories.serviceDetail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="detail" />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !serviceDetail) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={`/laboratories/${labId}`} />
            </IonButtons>
            <IonTitle>{t('laboratories.serviceDetail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <EmptyState
            type="error"
            title={t('laboratories.serviceNotFound')}
            message={t('laboratories.serviceNotFoundMessage')}
          />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/laboratories/${labId}`} />
          </IonButtons>
          <IonTitle>{t('laboratories.serviceDetail')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Header */}
        <div
          style={{
            padding: '20px 16px',
            backgroundColor: COLORS.brand,
            color: COLORS.brandText,
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
            {serviceDetail.Name}
          </h2>
          {serviceDetail.InternalIdent && (
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {serviceDetail.InternalIdent}
            </p>
          )}
        </div>

        <IonList lines="none">
          {serviceDetail.PrintName && serviceDetail.PrintName !== serviceDetail.Name && (
            <IonItem>
              <IonLabel>
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 4px 0' }}>
                  Bedruckungsname
                </p>
                <p style={{ color: COLORS.text, fontSize: '15px', margin: 0 }}>
                  {serviceDetail.PrintName}
                </p>
              </IonLabel>
            </IonItem>
          )}

          {serviceDetail.InitialDays !== undefined && serviceDetail.InitialDays !== null && (
            <IonItem>
              <IonIcon icon={timeOutline} slot="start" style={{ color: COLORS.brand }} />
              <IonLabel>
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 4px 0' }}>
                  Ansatztage
                </p>
                <p style={{ color: COLORS.text, fontSize: '15px', margin: 0 }}>
                  {serviceDetail.InitialDays} {serviceDetail.InitialDays === 1 ? 'Tag' : 'Tage'}
                </p>
              </IonLabel>
            </IonItem>
          )}

          {/* Materials Section */}
          {serviceDetail.Materials && serviceDetail.Materials.length > 0 && (
            <IonItem>
              <IonIcon icon={flaskOutline} slot="start" style={{ color: COLORS.brand }} />
              <IonLabel className="ion-text-wrap">
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 8px 0' }}>
                  Materialien ({serviceDetail.Materials.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {serviceDetail.Materials.map((material, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: COLORS.background,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${COLORS.brand}`,
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 500, color: COLORS.text }}>
                        {material.Name}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {material.RequiredQuantity && material.Unit && (
                          <span style={{ fontSize: '12px', color: COLORS.textLight }}>
                            Menge: {material.RequiredQuantity} {material.Unit}
                          </span>
                        )}
                        {material.Transport && (
                          <span style={{ fontSize: '12px', color: COLORS.textLight }}>
                            Transport: {material.Transport}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </IonLabel>
            </IonItem>
          )}

          {serviceDetail.Preanalytics && (
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 4px 0' }}>
                  Präanalytik
                </p>
                <p
                  style={{
                    color: COLORS.text,
                    fontSize: '15px',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {serviceDetail.Preanalytics}
                </p>
              </IonLabel>
            </IonItem>
          )}

          {serviceDetail.ClinicalIndication && (
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 4px 0' }}>
                  Klinische Indikation
                </p>
                <p
                  style={{
                    color: COLORS.text,
                    fontSize: '15px',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {serviceDetail.ClinicalIndication}
                </p>
              </IonLabel>
            </IonItem>
          )}

          {serviceDetail.Assessment && (
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 4px 0' }}>
                  Beurteilung
                </p>
                <p
                  style={{
                    color: COLORS.text,
                    fontSize: '15px',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {serviceDetail.Assessment}
                </p>
              </IonLabel>
            </IonItem>
          )}

          {serviceDetail.Tests && serviceDetail.Tests.length > 0 && (
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <p style={{ color: COLORS.textLight, fontSize: '12px', margin: '0 0 8px 0' }}>
                  Enthaltene Analysen ({serviceDetail.Tests.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {serviceDetail.Tests.map((test, idx) => (
                    <IonChip key={idx} style={{ margin: 0 }}>
                      {test.Ident || test.Name}
                    </IonChip>
                  ))}
                </div>
              </IonLabel>
            </IonItem>
          )}

          {serviceDetail.AdditionalInformationUrl && (
            <IonItem
              button
              onClick={() => window.open(serviceDetail.AdditionalInformationUrl, '_blank')}
            >
              <IonIcon icon={globeOutline} slot="start" color="primary" />
              <IonLabel>
                <p style={{ color: COLORS.text, fontSize: '15px', margin: 0 }}>
                  Weitere Informationen
                </p>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};
