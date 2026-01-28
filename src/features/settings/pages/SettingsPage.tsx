import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonAvatar,
} from '@ionic/react';
import {
  notificationsOutline,
  fingerPrintOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  helpCircleOutline,
  logOutOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../config/routes';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { user, logout, isLoggingOut } = useAuth();

  const settingsItems = [
    {
      icon: notificationsOutline,
      label: t('settings.notifications.title'),
      route: ROUTES.SETTINGS_NOTIFICATIONS,
    },
    {
      icon: fingerPrintOutline,
      label: t('settings.biometric.title'),
      route: ROUTES.SETTINGS_BIOMETRIC,
    },
    {
      icon: lockClosedOutline,
      label: t('settings.changePassword'),
      route: ROUTES.SETTINGS_PASSWORD,
    },
    {
      icon: shieldCheckmarkOutline,
      label: t('settings.privacy.title'),
      route: ROUTES.SETTINGS_PRIVACY,
    },
    {
      icon: helpCircleOutline,
      label: t('settings.support.faq'),
      route: ROUTES.SETTINGS_FAQ,
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('settings.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* User Profile Section */}
        {user && (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--ion-color-light)' }}>
            <IonAvatar style={{ width: '80px', height: '80px', margin: '0 auto 12px' }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--ion-color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: 600,
                }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </IonAvatar>
            <IonText color="dark">
              <h2 style={{ margin: '0 0 4px 0' }}>
                {user.firstName} {user.lastName}
              </h2>
            </IonText>
            <IonText color="medium">
              <p style={{ margin: 0 }}>{user.email}</p>
            </IonText>
          </div>
        )}

        {/* Settings List */}
        <IonList>
          {settingsItems.map((item) => (
            <IonItem
              key={item.route}
              button
              onClick={() => history.push(item.route)}
              detail
            >
              <IonIcon icon={item.icon} slot="start" color="primary" />
              <IonLabel>{item.label}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* Logout */}
        <IonList style={{ marginTop: '24px' }}>
          <IonItem button onClick={logout} disabled={isLoggingOut} detail={false}>
            <IonIcon icon={logOutOutline} slot="start" color="danger" />
            <IonLabel color="danger">{t('auth.logout')}</IonLabel>
          </IonItem>
        </IonList>

        {/* App Version */}
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <IonText color="medium" style={{ fontSize: '12px' }}>
            labGate v2.5.0
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};
