import React, { useState } from 'react';
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
  IonToggle,
  IonIcon,
  IonText,
} from '@ionic/react';
import { fingerPrintOutline, scanOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../config/routes';
import { useAuthStore } from '../../auth/store/authStore';

export const BiometricSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { biometricEnabled, setBiometricEnabled } = useAuthStore();

  const handleToggleBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SETTINGS} />
          </IonButtons>
          <IonTitle>{t('settings.biometric.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Info Section */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <IonIcon
            icon={fingerPrintOutline}
            style={{
              fontSize: '64px',
              color: biometricEnabled ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)',
            }}
          />
          <IonText color="dark">
            <h2 style={{ marginTop: '16px' }}>{t('settings.biometric.title')}</h2>
          </IonText>
          <IonText color="medium">
            <p>
              Nutzen Sie Fingerabdruck oder Face ID fuer eine schnelle und sichere Anmeldung.
            </p>
          </IonText>
        </div>

        <IonList>
          <IonItem>
            <IonIcon icon={fingerPrintOutline} slot="start" color="primary" />
            <IonLabel>
              <h2>{t('settings.biometric.enabled')}</h2>
              <p>Biometrische Authentifizierung aktivieren</p>
            </IonLabel>
            <IonToggle checked={biometricEnabled} onIonChange={handleToggleBiometric} />
          </IonItem>
        </IonList>

        {biometricEnabled && (
          <div
            style={{
              margin: '16px',
              padding: '16px',
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '8px',
            }}
          >
            <IonText color="medium">
              <p style={{ margin: 0, fontSize: '14px' }}>
                Die biometrische Anmeldung ist aktiviert. Bei der naechsten Anmeldung koennen Sie
                Fingerabdruck oder Face ID verwenden.
              </p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};
