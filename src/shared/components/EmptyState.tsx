import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { searchOutline, documentTextOutline, peopleOutline, businessOutline, newspaperOutline, alertCircleOutline } from 'ionicons/icons';
import emptyNewsImage from '../../assets/images/empty-news-details-undraw-news.svg';
import emptyPatientsImage from '../../assets/images/empty-patient-details-undraw-connecting-teams.svg';
import emptyLaboratoriesImage from '../../assets/images/empty-laboratory-details-undraw-scientist.svg';
import noDataImage from '../../assets/images/no-data-indicator.svg';

interface EmptyStateProps {
  type?: 'results' | 'patients' | 'laboratories' | 'news' | 'search' | 'generic' | 'error';
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
  error: alertCircleOutline,
};

const imageMap: Partial<Record<EmptyStateProps['type'] & string, string>> = {
  news: emptyNewsImage,
  patients: emptyPatientsImage,
  laboratories: emptyLaboratoriesImage,
  results: noDataImage,
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
  error: {
    title: 'Fehler',
    message: 'Ein Fehler ist aufgetreten.',
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
  const image = imageMap[type];
  const defaults = defaultMessages[type];

  return (
    <div className="empty-state">
      {image ? (
        <img
          src={image}
          alt=""
          className="empty-state-image"
        />
      ) : (
        <IonIcon
          icon={icon}
          className="empty-state-icon"
        />
      )}
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
