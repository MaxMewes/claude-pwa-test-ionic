import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
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
    <div className="empty-state">
      <IonIcon
        icon={icon}
        className="empty-state-icon"
      />
      <h2 className="empty-state-title">
        {title || defaults.title}
      </h2>
      <p className="empty-state-message">
        {message || defaults.message}
      </p>
      {actionLabel && onAction && (
        <IonButton onClick={onAction} fill="outline">
          {actionLabel}
        </IonButton>
      )}
    </div>
  );
};
