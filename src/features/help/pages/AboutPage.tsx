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
} from '@ionic/react';
import { useTranslation } from 'react-i18next';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

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
              backgroundColor: 'var(--ion-color-primary)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>LG</span>
          </div>
          <IonText color="dark">
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>labGate</h1>
          </IonText>
          <IonText color="medium">
            <p style={{ margin: 0 }}>Medizinische Laborbefunde</p>
            <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Version 2.5.0</p>
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
              <p>Entwickelt von</p>
              <h2>labGate GmbH</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>Kontakt</p>
              <h2>support@labgate.de</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>Website</p>
              <h2>www.labgate.de</h2>
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Legal */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <IonText color="medium" style={{ fontSize: '12px' }}>
            <p>Copyright 2024 labGate GmbH. Alle Rechte vorbehalten.</p>
            <p>Medizinprodukt der Klasse I gemaess MDR (EU) 2017/745</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};
