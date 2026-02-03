import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLaboratories } from '../hooks/useLaboratories';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';

export const LaboratoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useLaboratories();

  // Flatten paginated results
  const allLaboratories = data?.pages?.flatMap((page) => page.Results) || [];

  // Handle infinite scroll
  const handleLoadMore = async (event: CustomEvent<void>) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  const handleLaboratoryClick = (labId: string | number) => {
    history.push(`/laboratories/${labId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="ion-text-center">{t('laboratories.title')}</IonTitle>
          <IonButtons slot="end" style={{ visibility: 'hidden' }}>
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="list" count={5} />
        ) : !allLaboratories.length ? (
          <EmptyState type="laboratories" />
        ) : (
          <>
            <IonList lines="full">
              {allLaboratories.map((lab, index) => {
                const labId = lab.Id ?? lab.id ?? index;
                const labName = lab.Name ?? lab.name ?? 'Labor';

                return (
                  <IonItem
                    key={labId}
                    button
                    onClick={() => handleLaboratoryClick(labId)}
                    style={{
                      '--background': index % 2 === 0 ? 'var(--labgate-selected-bg)' : 'var(--labgate-surface)',
                    }}
                  >
                    <IonLabel>
                      <h2
                        style={{
                          fontWeight: 500,
                          fontSize: '15px',
                          color: 'var(--labgate-text)',
                          margin: 0,
                        }}
                      >
                        {labName}
                      </h2>
                    </IonLabel>
                    <IonIcon
                      icon={chevronForward}
                      slot="end"
                      style={{ color: 'var(--labgate-text-light)', fontSize: '18px' }}
                    />
                  </IonItem>
                );
              })}
            </IonList>
            <IonInfiniteScroll
              onIonInfinite={handleLoadMore}
              threshold="100px"
              disabled={!hasNextPage || isFetchingNextPage}
            >
              <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText={t('common.loadingMore')} />
            </IonInfiniteScroll>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
