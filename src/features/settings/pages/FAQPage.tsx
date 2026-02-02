import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/react';
import { searchOutline, closeOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useFAQ } from '../hooks/useFAQ';
import { SkeletonLoader, EmptyState } from '../../../shared/components';

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFAQ();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  // Flatten paginated results
  const allFAQs = data?.pages?.flatMap((page) => page.Results) || [];

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

  // Group FAQs by category and filter by search
  const groupedFAQs = useMemo(() => {
    if (!allFAQs.length) return {};

    const filtered = allFAQs.filter((faq) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category?.toLowerCase().includes(query)
      );
    });

    // Sort by order first
    const sorted = [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Group by category
    return sorted.reduce((acc, faq) => {
      const category = faq.category || 'Allgemein';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, typeof filtered>);
  }, [allFAQs, searchQuery]);

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>FAQ</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="list" count={8} />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>FAQ</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <EmptyState
            type="error"
            title="Fehler beim Laden"
            message="Die FAQ konnte nicht geladen werden. Bitte versuchen Sie es später erneut."
          />
        </IonContent>
      </IonPage>
    );
  }

  const categories = Object.keys(groupedFAQs);
  const hasResults = categories.length > 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          {isSearchOpen ? (
            <>
              <IonSearchbar
                ref={searchbarRef}
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value || '')}
                placeholder="FAQ durchsuchen..."
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
              <IonTitle>FAQ</IonTitle>
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
        {!hasResults ? (
          <EmptyState
            type="search"
            title={searchQuery ? 'Keine Ergebnisse' : 'Keine FAQ verfügbar'}
            message={
              searchQuery
                ? 'Keine FAQ-Einträge gefunden, die Ihrer Suche entsprechen.'
                : 'Aktuell sind keine FAQ-Einträge verfügbar.'
            }
            actionLabel={searchQuery ? 'Suche zurücksetzen' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <>
            <IonList lines="none">
              {categories.map((category) => (
                <div key={category} style={{ marginBottom: '20px' }}>
                  <IonListHeader>
                    <IonLabel>
                      <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--labgate-brand)' }}>
                        {category}
                      </h2>
                    </IonLabel>
                  </IonListHeader>
                  <IonAccordionGroup>
                    {groupedFAQs[category].map((faq) => (
                      <IonAccordion key={faq.id} value={faq.id}>
                        <IonItem slot="header" color="light">
                          <IonLabel
                            style={{
                              whiteSpace: 'normal',
                              fontSize: '15px',
                              fontWeight: '500',
                            }}
                          >
                            {faq.question}
                          </IonLabel>
                        </IonItem>
                        <div
                          className="ion-padding"
                          slot="content"
                          style={{
                            backgroundColor: 'var(--ion-background-color)',
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              lineHeight: 1.6,
                              whiteSpace: 'pre-line',
                              color: 'var(--labgate-text)',
                            }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </IonAccordion>
                    ))}
                  </IonAccordionGroup>
                </div>
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
