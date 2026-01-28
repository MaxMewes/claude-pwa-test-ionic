import React from 'react';
import { IonIcon, IonText, IonButton } from '@ionic/react';
import { searchOutline, documentTextOutline, peopleOutline, businessOutline, newspaperOutline } from 'ionicons/icons';

interface EmptyStateProps {
  type?: 'results' | 'patients' | 'laboratories' | 'news' | 'search' | 'generic';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const iconMap = {
  results: documentTextOutline,
  patients: peopleOutline,
  laboratories: businessOutline,
  news: newspaperOutline,
  search: searchOutline,
  generic: searchOutline,
};

const defaultMessages: Record<string, { title: string; message: string }> = {
  results: {
    title: 'Keine Befunde',
    message: 'Es sind keine Befunde vorhanden.',
  },
  patients: {
    title: 'Keine Patienten',
    message: 'Es sind keine Patienten vorhanden.',
  },
  laboratories: {
    title: 'Keine Labore',
    message: 'Es sind keine Labore vorhanden.',
  },
  news: {
    title: 'Keine Neuigkeiten',
    message: 'Es sind keine Neuigkeiten vorhanden.',
  },
  search: {
    title: 'Keine Ergebnisse',
    message: 'Ihre Suche ergab keine Treffer.',
  },
  generic: {
    title: 'Keine Daten',
    message: 'Es sind keine Daten vorhanden.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const icon = iconMap[type];
  const defaults = defaultMessages[type];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <IonIcon
        icon={icon}
        style={{
          fontSize: '64px',
          color: 'var(--ion-color-medium)',
          marginBottom: '16px',
        }}
      />
      <IonText color="dark">
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{title || defaults.title}</h2>
      </IonText>
      <IonText color="medium">
        <p style={{ margin: '0 0 24px 0', fontSize: '14px' }}>{message || defaults.message}</p>
      </IonText>
      {actionLabel && onAction && (
        <IonButton onClick={onAction} fill="outline">
          {actionLabel}
        </IonButton>
      )}
    </div>
  );
};
