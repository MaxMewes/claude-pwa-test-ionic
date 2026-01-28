import React, { useState, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { filterOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResults } from '../hooks/useResults';
import { ResultCard } from '../components/ResultCard';
import { ResultFilterModal } from '../components/ResultFilter';
import { SearchInput, PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { ResultFilter } from '../../../api/types';
import { ROUTES } from '../../../config/routes';

export const ResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [filter, setFilter] = useState<ResultFilter>({});
  const [showFilter, setShowFilter] = useState(false);

  const { data, isLoading, refetch } = useResults(filter);

  const handleSearch = useCallback((value: string) => {
    setFilter((prev) => ({ ...prev, search: value || undefined }));
  }, []);

  // labGate API v3 uses numeric Id
  const handleResultClick = (resultId: number) => {
    history.push(`/results/${resultId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const activeFilterCount =
    (filter.status?.length || 0) +
    (filter.category?.length || 0) +
    (filter.isRead !== undefined ? 1 : 0) +
    (filter.isPinned !== undefined ? 1 : 0);

  // labGate API v3 uses Items instead of data
  const results = data?.Items || [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('results.title')}</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => setShowFilter(true)}>
            <IonIcon icon={filterOutline} />
            {activeFilterCount > 0 && (
              <IonBadge color="danger" style={{ marginLeft: '4px' }}>
                {activeFilterCount}
              </IonBadge>
            )}
          </IonButton>
        </IonToolbar>
        <IonToolbar>
          <SearchInput onSearch={handleSearch} />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !results.length ? (
          <EmptyState
            type={filter.search ? 'search' : 'results'}
            actionLabel={filter.search ? t('common.reset') : undefined}
            onAction={filter.search ? () => setFilter({}) : undefined}
          />
        ) : (
          <div style={{ padding: '8px' }}>
            {results.map((result) => (
              <ResultCard
                key={result.Id}
                result={result}
                onClick={() => handleResultClick(result.Id)}
              />
            ))}
          </div>
        )}

        <ResultFilterModal
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          filter={filter}
          onFilterChange={setFilter}
        />
      </IonContent>
    </IonPage>
  );
};
