import React, { useState } from 'react';
import { IonInput, IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

interface PasswordInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <IonItem className={error ? 'ion-invalid' : ''}>
      <IonLabel position="stacked">{label}</IonLabel>
      <IonInput
        type={showPassword ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        onIonInput={(e) => onChange(e.detail.value || '')}
        onIonBlur={onBlur}
        disabled={disabled}
      />
      <IonButton
        fill="clear"
        slot="end"
        onClick={() => setShowPassword(!showPassword)}
        style={{ marginTop: '20px' }}
      >
        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
      </IonButton>
      {error && (
        <div slot="error" style={{ color: 'var(--ion-color-danger)', fontSize: '12px', padding: '4px 0' }}>
          {error}
        </div>
      )}
    </IonItem>
  );
};
