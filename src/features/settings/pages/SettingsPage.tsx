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
  IonToggle,
} from '@ionic/react';
import {
  notificationsOutline,
  fingerPrintOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  helpCircleOutline,
  logOutOutline,
  moonOutline,
  chevronForwardOutline,
  serverOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../config/routes';
import { useTheme } from '../../../shared/hooks/useTheme';
import { UserAvatar } from '../../../shared/components';
import { APP_CONFIG, getDisplayApiUrl } from '../../../config/app';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { user, logout, isLoggingOut } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();

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

  // Get display name - prefer full name, fallback to username
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'Benutzer';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('settings.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* User Profile Section - Modern Card Design */}
        {user && (
          <div style={{
            padding: '24px 16px',
            background: 'linear-gradient(135deg, var(--labgate-brand) 0%, #5cb84e 100%)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.97)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
            }}>
              {/* Avatar with Initials - uses username as fallback */}
              <UserAvatar
                firstName={user.firstName}
                lastName={user.lastName}
                username={user.username}
                size="lg"
                variant="gradient"
              />

              {/* User Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  margin: '0 0 4px 0',
                  color: 'var(--labgate-text)',
                  fontWeight: 600,
                  fontSize: '17px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {displayName}
                </h2>
                <p style={{
                  margin: 0,
                  color: 'var(--labgate-text-light)',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user.email || user.username}
                </p>
              </div>

              {/* Edit Profile Chevron */}
              <IonIcon
                icon={chevronForwardOutline}
                style={{
                  fontSize: '20px',
                  color: 'var(--labgate-text-muted)',
                }}
              />
            </div>
          </div>
        )}

        {/* Appearance */}
        <IonList>
          <IonItem>
            <IonIcon icon={moonOutline} slot="start" color="primary" />
            <IonLabel>{t('settings.darkMode')}</IonLabel>
            <IonToggle
              checked={isDark}
              onIonChange={toggleDarkMode}
              slot="end"
            />
          </IonItem>
        </IonList>

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

        {/* App Info Section */}
        <div style={{
          margin: '24px 16px',
          padding: '16px',
          backgroundColor: 'var(--labgate-selected-bg)',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            color: 'var(--labgate-text)',
            fontWeight: 600,
            fontSize: '13px',
          }}>
            <IonIcon icon={informationCircleOutline} style={{ fontSize: '18px' }} />
            App-Informationen
          </div>

          {/* App Version */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid var(--labgate-border)',
          }}>
            <span style={{ color: 'var(--labgate-text-light)', fontSize: '13px' }}>
              App-Version
            </span>
            <span style={{ color: 'var(--labgate-text)', fontSize: '13px', fontWeight: 500 }}>
              v{APP_CONFIG.version}
            </span>
          </div>

          {/* API URL */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid var(--labgate-border)',
          }}>
            <span style={{ color: 'var(--labgate-text-light)', fontSize: '13px' }}>
              <IonIcon icon={serverOutline} style={{ verticalAlign: 'middle', marginRight: '4px', fontSize: '14px' }} />
              API-Server
            </span>
            <span style={{
              color: 'var(--labgate-text)',
              fontSize: '12px',
              fontWeight: 500,
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {getDisplayApiUrl()}
            </span>
          </div>

          {/* API Version */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
          }}>
            <span style={{ color: 'var(--labgate-text-light)', fontSize: '13px' }}>
              API-Version
            </span>
            <span style={{
              color: 'var(--labgate-brand)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--labgate-brand-light, rgba(112, 204, 96, 0.1))',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              {APP_CONFIG.api.version}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ textAlign: 'center', padding: '8px 16px 24px' }}>
          <p style={{
            margin: 0,
            color: 'var(--labgate-text-muted)',
            fontSize: '11px',
          }}>
            © {new Date().getFullYear()} labGate. Alle Rechte vorbehalten.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};
