import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonMenuButton,
} from '@ionic/react';
import { searchOutline, closeOutline, barcodeOutline, funnelOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResults, useResultCounter, useMarkResultAsRead } from '../hooks/useResults';
import { useSettingsStore, ResultPeriodFilter } from '../../../shared/store/useSettingsStore';
import { ResultCard } from '../components/ResultCard';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { ResultFilterModal } from '../components/ResultFilter';
import { LabResult, ResultFilter } from '../../../api/types';

type ResultCategory = 'all' | 'unread' | 'pathological' | 'highPatho' | 'urgent';

export const ResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ResultCategory>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<ResultFilter>({});
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const { isFavorite, toggleFavorite, resultsPeriod } = useSettingsStore();

  // Read search parameter from URL on mount/change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
      setIsSearchOpen(true);
    }
  }, [location.search]);

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useResults(undefined, resultsPeriod);
  const { data: counter } = useResultCounter();

  // Flatten paginated results
  const allResults = data?.pages?.flatMap((page) => page.Results) || [];
  const markAsRead = useMarkResultAsRead();

  // Period title mapping
  const periodTitles: Record<ResultPeriodFilter, string> = {
    today: 'Heute',
    '7days': 'Letzten 7 Tage',
    '30days': 'Letzten 30 Tage',
    all: 'Alle',
    archive: 'Archiv',
  };

  // Focus searchbar when opening
  useEffect(() => {
    if (isSearchOpen && searchbarRef.current) {
      setTimeout(() => {
        searchbarRef.current?.setFocus();
      }, 100);
    }
  }, [isSearchOpen]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearchQuery('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const handleBarcodeScan = () => {
    setIsScannerOpen(true);
  };

  const handleBarcodeResult = (barcode: string) => {
    setSearchQuery(barcode);
    setIsSearchOpen(true);
  };

  const handleResultClick = (resultId: number, isRead: boolean) => {
    // Mark as read when clicking on unread result
    if (!isRead) {
      markAsRead.mutate([resultId]);
    }
    history.push(`/results/${resultId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleToggleFavorite = (resultId: number) => {
    toggleFavorite(resultId);
  };

  // Filter results based on category and search (period is now filtered by API)
  const filteredResults = useMemo(() => {
    let results = allResults;

    // Apply category filter
    switch (category) {
      case 'unread':
        results = results.filter((r) => !r.IsRead);
        break;
      case 'pathological':
        results = results.filter((r) => r.IsPathological && !r.IsUrgent);
        break;
      case 'highPatho':
        // High pathological - has critical values (HH or LL indicators)
        results = results.filter((r) => r.IsPathological && r.HasCriticalValues);
        break;
      case 'urgent':
        results = results.filter((r) => r.IsUrgent);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((r) => {
        const patientName = r.Patient?.Fullname ||
          `${r.Patient?.Firstname || ''} ${r.Patient?.Lastname || ''}`;
        return (
          patientName.toLowerCase().includes(query) ||
          r.LabNo?.toLowerCase().includes(query)
        );
      });
    }

    return results;
  }, [allResults, category, searchQuery]);

  // Calculate counts for each category (based on API-filtered results)
  const counts = useMemo(() => {
    return {
      all: allResults.length,
      unread: allResults.filter((r) => !r.IsRead).length,
      pathological: allResults.filter((r) => r.IsPathological && !r.IsUrgent).length,
      highPatho: allResults.filter((r) => r.IsPathological && r.HasCriticalValues).length,
      urgent: allResults.filter((r) => r.IsUrgent).length,
    };
  }, [allResults]);

  // Handle infinite scroll
  const handleLoadMore = async (event: CustomEvent<void>) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  const tabs: { key: ResultCategory; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'Alle', count: counts.all, color: '#000000' },
    { key: 'unread', label: 'Ungelesen', count: counts.unread, color: '#000000' },
    { key: 'pathological', label: 'Pathologisch', count: counts.pathological, color: '#F59E0B' },
    { key: 'highPatho', label: 'Hochpatho.', count: counts.highPatho, color: '#EF4444' },
    { key: 'urgent', label: 'Notfall', count: counts.urgent, color: '#EF4444' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {isSearchOpen ? (
            // Search mode - show searchbar
            <>
              <IonSearchbar
                ref={searchbarRef}
                value={searchQuery}
                onIonInput={(e) => handleSearch(e.detail.value || '')}
                placeholder="Patient oder Labor-Nr. suchen..."
                animated
                showCancelButton="never"
                style={{ '--background': 'var(--labgate-selected-bg)' }}
              />
              <IonButtons slot="end">
                <IonButton onClick={handleBarcodeScan}>
                  <IonIcon icon={barcodeOutline} />
                </IonButton>
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </>
          ) : (
            // Normal mode - show title and icons
            <>
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>
              <IonTitle className="ion-text-center">Befunde - {periodTitles[resultsPeriod]}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsFilterOpen(true)}>
                  <IonIcon icon={funnelOutline} />
                </IonButton>
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={searchOutline} />
                </IonButton>
              </IonButtons>
            </>
          )}
        </IonToolbar>

        {/* Category Filter Tabs */}
        <IonToolbar
          className="results-filter-toolbar"
          style={{
            '--padding-top': '0',
            '--padding-bottom': '0',
            '--padding-start': '0',
            '--padding-end': '0',
            '--min-height': '48px',
            '--border-width': '0',
            height: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '48px',
            }}
          >
            {tabs.map((tab) => {
              const isActive = category === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCategory(tab.key)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 4px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--ion-toolbar-color, var(--ion-text-color))',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: tab.color === '#000000' ? 'var(--ion-toolbar-color, var(--ion-text-color))' : tab.color,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="list" count={8} />
        ) : !filteredResults.length ? (
          <EmptyState
            type="results"
            title="Keine Befunde mit dem angewendeten Filter gefunden."
            message="Versuchen Sie einen anderen Filter."
          />
        ) : (
          <>
            <IonList lines="none" style={{ padding: 0 }}>
              {filteredResults.map((result: LabResult) => (
                <ResultCard
                  key={result.Id}
                  result={result}
                  isFavorite={isFavorite(result.Id)}
                  onClick={() => handleResultClick(result.Id, result.IsRead)}
                  onToggleFavorite={() => handleToggleFavorite(result.Id)}
                />
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

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeResult}
      />

      {/* Filter Modal */}
      <ResultFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filter={filter}
        onFilterChange={setFilter}
      />
    </IonPage>
  );
};
