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
  IonToggle,
  IonIcon,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { ResultFilter as FilterType, ResultTypeFilter, LabCategoryFilter } from '../../../api/types';

interface ResultFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const resultTypes: { key: ResultTypeFilter; label: string }[] = [
  { key: 'final', label: 'Endbefund' },
  { key: 'partial', label: 'Teilbefund' },
  { key: 'preliminary', label: 'Vorläufiger Befund' },
  { key: 'followUp', label: 'Nachforderung' },
  { key: 'archive', label: 'Archivbefund' },
];

const labCategories: { key: LabCategoryFilter; label: string }[] = [
  { key: 'specialist', label: 'Facharzt' },
  { key: 'labCommunity', label: 'Laborgemeinschaft' },
  { key: 'microbiology', label: 'Mikrobiologie' },
];

export const ResultFilterModal: React.FC<ResultFilterModalProps> = ({
  isOpen,
  onClose,
  filter,
  onFilterChange,
}) => {
  const toggleFavoritesOnly = () => {
    onFilterChange({
      ...filter,
      isPinned: filter.isPinned === true ? undefined : true,
    });
  };

  const toggleResultType = (type: ResultTypeFilter) => {
    const currentTypes = filter.resultTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFilterChange({ ...filter, resultTypes: newTypes.length ? newTypes : undefined });
  };

  const toggleLabCategory = (category: LabCategoryFilter) => {
    const currentCategories = filter.labCategories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    onFilterChange({ ...filter, labCategories: newCategories.length ? newCategories : undefined });
  };

  const resetFilters = () => {
    onFilterChange({});
    onClose();
  };

  const hasActiveFilters =
    (filter.resultTypes?.length ?? 0) > 0 ||
    (filter.labCategories?.length ?? 0) > 0 ||
    filter.isPinned !== undefined;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Filter anwenden</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Favorites Only Filter */}
        <IonList lines="full" style={{ marginBottom: '16px' }}>
          <IonItem>
            <IonLabel>Nur gemerkte Befunde anzeigen</IonLabel>
            <IonToggle
              slot="end"
              checked={filter.isPinned === true}
              onIonChange={toggleFavoritesOnly}
            />
          </IonItem>
        </IonList>

        {/* Result Type Filters */}
        <IonList lines="full" style={{ marginBottom: '16px' }}>
          {resultTypes.map((type) => (
            <IonItem key={type.key}>
              <IonLabel>{type.label}</IonLabel>
              <IonToggle
                slot="end"
                checked={filter.resultTypes?.includes(type.key) || false}
                onIonChange={() => toggleResultType(type.key)}
              />
            </IonItem>
          ))}
        </IonList>

        {/* Lab Category Filters */}
        <IonList lines="full" style={{ marginBottom: '16px' }}>
          {labCategories.map((category) => (
            <IonItem key={category.key}>
              <IonLabel>{category.label}</IonLabel>
              <IonToggle
                slot="end"
                checked={filter.labCategories?.includes(category.key) || false}
                onIonChange={() => toggleLabCategory(category.key)}
              />
            </IonItem>
          ))}
        </IonList>

        {/* Reset Button */}
        <div style={{ padding: '16px 16px 32px 16px' }}>
          <IonButton
            expand="block"
            fill="clear"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            style={{
              '--color': '#70CC60',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'uppercase',
            }}
          >
            ALLE FILTER ZURÜCKSETZEN
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};
