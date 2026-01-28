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
  IonToggle,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../config/routes';

export const NotificationSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  // In a real app, these would come from a settings store/API
  const [settings, setSettings] = React.useState({
    enabled: true,
    newResults: true,
    criticalResults: true,
    news: true,
    reminders: false,
    sound: true,
    vibration: true,
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
          <IonTitle>{t('settings.notifications.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <h2>{t('settings.notifications.enabled')}</h2>
            </IonLabel>
            <IonToggle
              checked={settings.enabled}
              onIonChange={() => handleToggle('enabled')}
            />
          </IonItem>
        </IonList>

        {settings.enabled && (
          <>
            <IonList>
              <IonItem lines="none" color="light">
                <IonLabel>
                  <h2 style={{ fontWeight: 600 }}>Benachrichtigungstypen</h2>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>{t('settings.notifications.newResults')}</h2>
                  <p>Bei neuen Laborbefunden</p>
                </IonLabel>
                <IonToggle
                  checked={settings.newResults}
                  onIonChange={() => handleToggle('newResults')}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>{t('settings.notifications.criticalResults')}</h2>
                  <p>Bei kritischen Laborwerten</p>
                </IonLabel>
                <IonToggle
                  checked={settings.criticalResults}
                  onIonChange={() => handleToggle('criticalResults')}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>{t('settings.notifications.news')}</h2>
                  <p>Bei neuen Artikeln und Ankuendigungen</p>
                </IonLabel>
                <IonToggle
                  checked={settings.news}
                  onIonChange={() => handleToggle('news')}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>{t('settings.notifications.reminders')}</h2>
                  <p>Erinnerungen an Termine</p>
                </IonLabel>
                <IonToggle
                  checked={settings.reminders}
                  onIonChange={() => handleToggle('reminders')}
                />
              </IonItem>
            </IonList>

            <IonList>
              <IonItem lines="none" color="light">
                <IonLabel>
                  <h2 style={{ fontWeight: 600 }}>Signale</h2>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>{t('settings.notifications.sound')}</h2>
                </IonLabel>
                <IonToggle
                  checked={settings.sound}
                  onIonChange={() => handleToggle('sound')}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>{t('settings.notifications.vibration')}</h2>
                </IonLabel>
                <IonToggle
                  checked={settings.vibration}
                  onIonChange={() => handleToggle('vibration')}
                />
              </IonItem>
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
