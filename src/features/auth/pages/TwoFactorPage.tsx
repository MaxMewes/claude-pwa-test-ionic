import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonSpinner,
  IonInput,
  IonItem,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../../config/routes';

export const TwoFactorPage: React.FC = () => {
  const { t } = useTranslation();
  const { verifyTwoFactor, isVerifying, twoFactorError } = useAuth();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      verifyTwoFactor(code);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.LOGIN} />
          </IonButtons>
          <IonTitle>{t('auth.twoFactor.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 'calc(100% - 56px)',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--ion-color-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <span style={{ color: '#fff', fontSize: '28px' }}>2FA</span>
            </div>
            <IonText color="dark">
              <h2 style={{ margin: '0 0 8px 0' }}>{t('auth.twoFactor.title')}</h2>
            </IonText>
            <IonText color="medium">
              <p style={{ margin: 0 }}>{t('auth.twoFactor.description')}</p>
            </IonText>
          </div>

          {/* Code Input Form */}
          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="stacked">{t('auth.twoFactor.code')}</IonLabel>
              <IonInput
                type="text"
                inputMode="numeric"
                maxlength={6}
                placeholder="000000"
                value={code}
                onIonInput={(e) => setCode(e.detail.value || '')}
                style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
              />
            </IonItem>

            {/* Error Message */}
            {twoFactorError && (
              <IonText color="danger">
                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                  {t('auth.twoFactor.invalidCode')}
                </p>
              </IonText>
            )}

            {/* Submit Button */}
            <IonButton
              type="submit"
              expand="block"
              style={{ marginTop: '24px' }}
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? <IonSpinner name="crescent" /> : t('auth.twoFactor.verify')}
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};
