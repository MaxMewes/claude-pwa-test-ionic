import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonSkeletonText,
  IonText,
  IonNote,
  IonButtons,
  IonButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/react';
import { searchOutline, closeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSenders } from '../hooks/useSenders';

export const SendersPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const { senders, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useSenders({ query: searchQuery });

  // Handle infinite scroll
  const handleLoadMore = async (event: CustomEvent<void>) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  // Focus searchbar when opening
  useEffect(() => {
    if (isSearchOpen && searchbarRef.current) {
      setTimeout(() => {
        searchbarRef.current?.setFocus();
      }, 100);
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearchQuery('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {isSearchOpen ? (
            <>
              <IonSearchbar
                ref={searchbarRef}
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value || '')}
                placeholder="Einsender suchen..."
                animated
                showCancelButton="never"
                style={{ '--background': 'var(--labgate-selected-bg)' }}
              />
              <IonButtons slot="end">
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </>
          ) : (
            <>
              <IonTitle>{t('senders.title')}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={searchOutline} />
                </IonButton>
              </IonButtons>
            </>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading ? (
          <IonList>
            {[...Array(5)].map((_, i) => (
              <IonItem key={i}>
                <IonAvatar slot="start">
                  <IonSkeletonText animated />
                </IonAvatar>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                  <IonSkeletonText animated style={{ width: '40%' }} />
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : !senders?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <IonText color="medium">
              <p>{t('senders.noSenders')}</p>
            </IonText>
          </div>
        ) : (
          <>
            <IonList>
              {senders.map((sender) => (
                <IonItem
                  key={sender.Id}
                  button
                  onClick={() => history.push(`/senders/${sender.Id}`)}
                  detail
                >
                  <IonAvatar slot="start">
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'var(--labgate-brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--labgate-brand-text-on-brand)',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                    >
                      {getInitials(sender.Firstname, sender.Lastname)}
                    </div>
                  </IonAvatar>
                  <IonLabel>
                    <h2>{`${sender.Firstname} ${sender.Lastname}`.trim()}</h2>
                    {sender.Site?.Name && (
                      <IonNote>{sender.Site.Name}</IonNote>
                    )}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
            <IonInfiniteScroll
              onIonInfinite={handleLoadMore}
              threshold="100px"
              disabled={!hasNextPage || isFetchingNextPage}
            >
              <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Lade mehr..." />
            </IonInfiniteScroll>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
