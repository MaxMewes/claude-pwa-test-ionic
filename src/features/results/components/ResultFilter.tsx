import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonIcon,
} from '@ionic/react';
import { closeOutline, refreshOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ResultFilter as FilterType, ResultStatus, ResultCategory } from '../../../api/types';

interface ResultFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const statuses: ResultStatus[] = ['pending', 'partial', 'final', 'corrected'];
const categories: ResultCategory[] = [
  'hematology',
  'chemistry',
  'immunology',
  'microbiology',
  'urinalysis',
  'coagulation',
  'other',
];

export const ResultFilterModal: React.FC<ResultFilterModalProps> = ({
  isOpen,
  onClose,
  filter,
  onFilterChange,
}) => {
  const { t } = useTranslation();

  const toggleStatus = (status: ResultStatus) => {
    const currentStatuses = filter.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filter, status: newStatuses.length ? newStatuses : undefined });
  };

  const toggleCategory = (category: ResultCategory) => {
    const currentCategories = filter.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    onFilterChange({ ...filter, category: newCategories.length ? newCategories : undefined });
  };

  const toggleUnread = () => {
    onFilterChange({
      ...filter,
      isRead: filter.isRead === false ? undefined : false,
    });
  };

  const togglePinned = () => {
    onFilterChange({
      ...filter,
      isPinned: filter.isPinned === true ? undefined : true,
    });
  };

  const resetFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    (filter.status?.length ?? 0) > 0 ||
    (filter.category?.length ?? 0) > 0 ||
    filter.isRead !== undefined ||
    filter.isPinned !== undefined;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{t('results.filter.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={resetFilters} disabled={!hasActiveFilters}>
              <IonIcon icon={refreshOutline} slot="start" />
              {t('common.reset')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Quick Filters */}
        <IonList>
          <IonItem>
            <IonCheckbox
              slot="start"
              checked={filter.isRead === false}
              onIonChange={toggleUnread}
            />
            <IonLabel>{t('results.filter.unread')}</IonLabel>
          </IonItem>
          <IonItem>
            <IonCheckbox
              slot="start"
              checked={filter.isPinned === true}
              onIonChange={togglePinned}
            />
            <IonLabel>{t('results.filter.pinned')}</IonLabel>
          </IonItem>
        </IonList>

        {/* Status Filter */}
        <IonList>
          <IonItem lines="none">
            <IonLabel>
              <h2>{t('results.filter.status')}</h2>
            </IonLabel>
          </IonItem>
          {statuses.map((status) => (
            <IonItem key={status}>
              <IonCheckbox
                slot="start"
                checked={filter.status?.includes(status) || false}
                onIonChange={() => toggleStatus(status)}
              />
              <IonLabel>{t(`results.status.${status}`)}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* Category Filter */}
        <IonList>
          <IonItem lines="none">
            <IonLabel>
              <h2>{t('results.filter.category')}</h2>
            </IonLabel>
          </IonItem>
          {categories.map((category) => (
            <IonItem key={category}>
              <IonCheckbox
                slot="start"
                checked={filter.category?.includes(category) || false}
                onIonChange={() => toggleCategory(category)}
              />
              <IonLabel>{t(`results.category.${category}`)}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>
  );
};
