import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { searchOutline, documentTextOutline, peopleOutline, businessOutline, newspaperOutline, alertCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
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

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const { t } = useTranslation();
  const icon = iconMap[type];
  const image = imageMap[type];

  const defaultMessages: Record<string, { title: string; message: string }> = {
    results: {
      title: t('emptyState.results.title'),
      message: t('emptyState.results.message'),
    },
    patients: {
      title: t('emptyState.patients.title'),
      message: t('emptyState.patients.message'),
    },
    laboratories: {
      title: t('emptyState.laboratories.title'),
      message: t('emptyState.laboratories.message'),
    },
    news: {
      title: t('emptyState.news.title'),
      message: t('emptyState.news.message'),
    },
    search: {
      title: t('emptyState.search.title'),
      message: t('emptyState.search.message'),
    },
    generic: {
      title: t('emptyState.generic.title'),
      message: t('emptyState.generic.message'),
    },
    error: {
      title: t('emptyState.error.title'),
      message: t('emptyState.error.message'),
    },
  };

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
