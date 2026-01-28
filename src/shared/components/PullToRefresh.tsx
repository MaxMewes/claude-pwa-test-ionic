import React from 'react';
import { IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh }) => {
  const { t } = useTranslation();

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await onRefresh();
    } finally {
      event.detail.complete();
    }
  };

  return (
    <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
      <IonRefresherContent
        pullingText={t('common.pullToRefresh')}
        refreshingSpinner="crescent"
      />
    </IonRefresher>
  );
};
