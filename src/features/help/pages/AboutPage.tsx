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
  IonText,
  IonBadge,
  IonSpinner,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useUpdateInfo } from '../hooks/useUpdateInfo';

// Import version from package.json
const APP_VERSION = '0.0.1';
const LABGATE_API_VERSION = 'v3';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: updateInfo, isLoading: isLoadingUpdate } = useUpdateInfo();

  const getUpdateBadge = () => {
    if (isLoadingUpdate) {
      return <IonSpinner name="crescent" style={{ width: '16px', height: '16px' }} />;
    }

    if (!updateInfo) return null;

    switch (updateInfo.UpdateType) {
      case 'Required':
        return (
          <IonBadge color="danger" style={{ marginLeft: '8px' }}>
            Update erforderlich
          </IonBadge>
        );
      case 'Optional':
        return (
          <IonBadge color="warning" style={{ marginLeft: '8px' }}>
            Update verfügbar
          </IonBadge>
        );
      case 'None':
      default:
        return (
          <IonBadge color="success" style={{ marginLeft: '8px' }}>
            Aktuell
          </IonBadge>
        );
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/help" />
          </IonButtons>
          <IonTitle>{t('help.about')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Logo and App Info */}
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--labgate-brand)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ color: 'var(--labgate-brand-text-on-brand, #ffffff)', fontSize: '32px', fontWeight: 'bold' }}>🧪</span>
          </div>
          <IonText color="dark">
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>labGate</h1>
          </IonText>
          <IonText color="medium">
            <p style={{ margin: 0 }}>Medizinische Laborbefunde</p>
            <p style={{ margin: '8px 0 0', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              App Version {APP_VERSION}
              {getUpdateBadge()}
            </p>
          </IonText>
        </div>

        {/* Description */}
        <div style={{ padding: '0 24px 24px' }}>
          <IonText>
            <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)' }}>
              labGate ermoeglicht Ihnen den sicheren und einfachen Zugriff auf Ihre Laborbefunde.
              Alle Daten werden verschluesselt uebertragen und entsprechen hoechsten Datenschutzstandards.
            </p>
          </IonText>
        </div>

        {/* Info List */}
        <IonList>
          <IonItem>
            <IonLabel>
              <p>App Version</p>
              <h2 style={{ display: 'flex', alignItems: 'center' }}>
                {APP_VERSION}
                {getUpdateBadge()}
              </h2>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <p>labGate API Version</p>
              <h2>{LABGATE_API_VERSION}</h2>
            </IonLabel>
          </IonItem>

          {updateInfo?.CurrentVersion && (
            <IonItem>
              <IonLabel>
                <p>labGate Backend Version</p>
                <h2>{updateInfo.CurrentVersion}</h2>
              </IonLabel>
            </IonItem>
          )}

          {updateInfo?.MinimumVersion && (
            <IonItem>
              <IonLabel>
                <p>Mindestversion</p>
                <h2>{updateInfo.MinimumVersion}</h2>
              </IonLabel>
            </IonItem>
          )}

          <IonItem>
            <IonLabel>
              <p>Entwickelt von</p>
              <h2>vireq software solutions GmbH</h2>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <p>Anschrift</p>
              <h2>Carl-Reichstein-Straße 11, 14770 Brandenburg an der Havel</h2>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <p>Geschäftsführer</p>
              <h2>Vico Weist, René Mewes, Christian Sauer, Sebastian Münch</h2>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <p>Kontakt</p>
              <h2>+49 3381 33198 40 • info@vireq.com</h2>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <p>Website</p>
              <h2>www.vireq.com</h2>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <p>USt-IdNr.</p>
              <h2>DE 270371969</h2>
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Technical Details */}
        <div style={{ padding: '24px' }}>
          <IonText color="medium" style={{ fontSize: '12px' }}>
            <p style={{ textAlign: 'center', margin: '0 0 8px' }}>
              <strong>Technische Details:</strong>
            </p>
            <p style={{ textAlign: 'center', margin: '4px 0' }}>
              Ionic React • Capacitor • TypeScript
            </p>
            <p style={{ textAlign: 'center', margin: '4px 0' }}>
              PWA-fähig • Offline-Support
            </p>
          </IonText>
        </div>

        {/* Legal */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <IonText color="medium" style={{ fontSize: '12px' }}>
            <p>© 2026 vireq software solutions GmbH. Alle Rechte vorbehalten.</p>
            <p>Medizinprodukt der Klasse I gemäß MDR (EU) 2017/745</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};
