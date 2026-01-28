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
  IonText,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../config/routes';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    shareAnalytics: true,
    showProfilePhoto: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SETTINGS} />
          </IonButtons>
          <IonTitle>{t('settings.privacy.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <h2>{t('settings.privacy.shareAnalytics')}</h2>
              <p>Anonyme Nutzungsdaten zur Verbesserung der App teilen</p>
            </IonLabel>
            <IonToggle
              checked={settings.shareAnalytics}
              onIonChange={() => handleToggle('shareAnalytics')}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>{t('settings.privacy.showProfilePhoto')}</h2>
              <p>Profilbild in der App anzeigen</p>
            </IonLabel>
            <IonToggle
              checked={settings.showProfilePhoto}
              onIonChange={() => handleToggle('showProfilePhoto')}
            />
          </IonItem>
        </IonList>

        {/* Privacy Policy Link */}
        <IonList style={{ marginTop: '24px' }}>
          <IonItem button detail>
            <IonLabel>
              <h2>{t('settings.privacy.policy')}</h2>
              <p>Vollstaendige Datenschutzerklaerung lesen</p>
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Info Text */}
        <div style={{ padding: '16px' }}>
          <IonText color="medium">
            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Ihre Gesundheitsdaten sind uns wichtig. Alle Daten werden verschluesselt
              uebertragen und gespeichert. Wir geben keine personenbezogenen Daten an
              Dritte weiter.
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};
