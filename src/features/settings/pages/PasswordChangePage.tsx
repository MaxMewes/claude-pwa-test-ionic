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
  IonButton,
  IonSpinner,
  IonText,
  IonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import { PasswordInput } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

export const PasswordChangePage: React.FC = () => {
  const { t } = useTranslation();
  const { changePassword, isChangingPassword, changePasswordError } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Aktuelles Passwort ist erforderlich';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Neues Passwort ist erforderlich';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Mindestens 8 Zeichen erforderlich';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('settings.password.mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await changePassword(currentPassword, newPassword);
      setShowSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.SETTINGS} />
          </IonButtons>
          <IonTitle>{t('settings.changePassword')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonText color="medium">
          <p style={{ marginBottom: '24px' }}>{t('settings.password.requirements')}</p>
        </IonText>

        <IonList>
          <PasswordInput
            label={t('settings.password.current')}
            value={currentPassword}
            onChange={setCurrentPassword}
            error={errors.currentPassword}
          />

          <PasswordInput
            label={t('settings.password.new')}
            value={newPassword}
            onChange={setNewPassword}
            error={errors.newPassword}
          />

          <PasswordInput
            label={t('settings.password.confirm')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
          />
        </IonList>

        {changePasswordError && (
          <IonText color="danger">
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              Das aktuelle Passwort ist falsch.
            </p>
          </IonText>
        )}

        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={isChangingPassword}
          style={{ marginTop: '24px' }}
        >
          {isChangingPassword ? <IonSpinner name="crescent" /> : t('common.save')}
        </IonButton>

        <IonToast
          isOpen={showSuccess}
          onDidDismiss={() => setShowSuccess(false)}
          message={t('settings.password.success')}
          duration={3000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};
