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
  IonMenuButton,
} from '@ionic/react';
import { searchOutline, closeOutline, barcodeOutline, funnelOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResults, useResultCounter, useMarkResultAsRead } from '../hooks/useResults';
import { useSettingsStore, ResultPeriodFilter } from '../../../shared/store/useSettingsStore';
import { ResultCard } from '../components/ResultCard';
import { PullToRefresh, EmptyState, TestTubeLoader } from '../../../shared/components';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { ResultFilterModal } from '../components/ResultFilter';
import { LabResult, ResultFilter } from '../../../api/types';

type ResultCategory = 'all' | 'unread' | 'pathological' | 'highPatho' | 'urgent';

// Valid period values for URL parameter validation
const VALID_PERIODS: ResultPeriodFilter[] = ['today', '7days', '30days', 'all', 'archive'];

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
  const lastFetchTimeRef = useRef<number>(0);

  const { isFavorite, toggleFavorite, resultsPeriod: storedPeriod, setResultsPeriod } = useSettingsStore();

  // Read period and search from URL, fall back to store
  const urlParams = new URLSearchParams(location.search);
  const urlPeriod = urlParams.get('period') as ResultPeriodFilter | null;
  const effectivePeriod: ResultPeriodFilter = (urlPeriod && VALID_PERIODS.includes(urlPeriod)) ? urlPeriod : storedPeriod;

  // Sync URL period to store on mount/change
  useEffect(() => {
    if (urlPeriod && VALID_PERIODS.includes(urlPeriod) && urlPeriod !== storedPeriod) {
      setResultsPeriod(urlPeriod);
    }
  }, [urlPeriod, storedPeriod, setResultsPeriod]);

  // Read search parameter from URL on mount/change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
      setIsSearchOpen(true);
    }
  }, [location.search]);

  // Update URL when period changes (from settings page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentUrlPeriod = params.get('period');
    if (currentUrlPeriod !== storedPeriod) {
      params.set('period', storedPeriod);
      history.replace({ pathname: location.pathname, search: params.toString() });
    }
  }, [storedPeriod, location.pathname, location.search, history]);

  // Combine filter state with category for API - maps UI category to API area filter
  const effectiveFilter = useMemo((): ResultFilter => {
    const categoryToArea: Record<ResultCategory, ResultFilter['area']> = {
      all: undefined,        // No filter - show all
      unread: 'new',         // API: resultCategory = 'New'
      pathological: 'pathological',
      highPatho: 'highPathological',
      urgent: 'urgent',
    };
    return {
      ...filter,
      area: categoryToArea[category] || filter.area,
    };
  }, [filter, category]);

  const { data, isLoading, isFetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useResults(effectiveFilter, effectivePeriod);

  // Show skeleton when loading fresh data (initial load or filter/category change), but not during pagination
  const showSkeleton = isLoading || (isFetching && !isFetchingNextPage && !data?.pages?.length);
  const { data: counter } = useResultCounter(effectivePeriod);

  // Flatten paginated results
  const allResults = data?.pages?.flatMap((page) => page.Results) || [];
  const markAsRead = useMarkResultAsRead();

  // Period title mapping
  const periodTitles: Record<ResultPeriodFilter, string> = {
    today: t('results.period.today'),
    '7days': t('results.period.7days'),
    '30days': t('results.period.30days'),
    all: t('results.period.all'),
    archive: t('results.period.archive'),
  };

  // Focus searchbar when opening
  useEffect(() => {
    if (isSearchOpen && searchbarRef.current) {
      setTimeout(() => {
        searchbarRef.current?.setFocus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Automatically fetch second page right after first page loads (only if first page was full)
  useEffect(() => {
    const firstPage = data?.pages?.[0];
    const firstPageFull = firstPage && firstPage.Results.length >= firstPage.ItemsPerPage;
    if (data?.pages?.length === 1 && firstPageFull && hasNextPage && !isFetchingNextPage && !isLoading && !isFetching) {
      fetchNextPage();
    }
  }, [data?.pages, hasNextPage, isFetchingNextPage, isLoading, isFetching, fetchNextPage]);

  // Handle infinite scroll via IonContent scroll event
  const handleScroll = useCallback((event: CustomEvent) => {
    // Skip scroll-based loading during initial load or auto-prefetch
    const pagesLoaded = data?.pages?.length ?? 0;
    if (pagesLoaded < 2) return;

    // Debounce: prevent fetching more than once per second
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) return;

    const target = event.target as HTMLIonContentElement;
    target.getScrollElement().then((scrollElement) => {
      const scrollTop = scrollElement.scrollTop;
      const scrollHeight = scrollElement.scrollHeight;
      const clientHeight = scrollElement.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Load more when within 800px of bottom
      if (distanceFromBottom < 800 && hasNextPage && !isFetchingNextPage && !isLoading && !isFetching) {
        lastFetchTimeRef.current = now;
        fetchNextPage();
      }
    });
  }, [data?.pages?.length, hasNextPage, isFetchingNextPage, isLoading, isFetching, fetchNextPage]);

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

  // Filter results based on search and filter modal settings
  // Note: Category filter is now passed to API via effectiveFilter.area
  const filteredResults = useMemo(() => {
    let results = allResults;

    // Category filtering is now handled by API (via effectiveFilter.area -> resultCategory)
    // No need for client-side category filtering anymore

    // Client-side filter for result types (fallback if API doesn't support or as additional filter)
    // Type codes: E=Endbefund, T=Teilbefund, V=Vorläufig, N=Nachforderung, A=Archiv
    if (filter.resultTypes?.length) {
      const typeMap: Record<string, string> = {
        final: 'E',
        partial: 'T',
        preliminary: 'V',
        followUp: 'N',
        archive: 'A',
      };
      const allowedTypes = filter.resultTypes.map(t => typeMap[t]).filter(Boolean);
      if (allowedTypes.length) {
        results = results.filter((r) => {
          const resultType = (r as LabResult & { Type?: string }).Type;
          return resultType && allowedTypes.includes(resultType);
        });
      }
    }

    // Client-side filter for favorites (fallback if API doesn't support)
    if (filter.isPinned) {
      results = results.filter((r) => r.IsFavorite || isFavorite(r.Id));
    }

    // Client-side filter for lab categories (API doesn't support this)
    // Note: labCategories filter would need Sender.SpecialField or similar, skipping if not available
    // if (filter.labCategories?.length) {
    //   results = results.filter based on sender/laboratory type
    // }

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
  }, [allResults, searchQuery, filter, isFavorite]);

  // Use API counter for total counts, fall back to loaded results if counter not available
  const counts = useMemo(() => {
    if (counter) {
      return {
        all: counter.Total,
        unread: counter.New,
        pathological: counter.Pathological,
        highPatho: counter.HighPathological ?? 0,
        urgent: counter.Urgent,
      };
    }
    // Fallback to loaded results count (using correct API field names)
    return {
      all: allResults.length,
      unread: allResults.filter((r) => !r.IsRead).length,
      pathological: allResults.filter((r) => r.IsPatho && !r.IsEmergency).length,
      highPatho: allResults.filter((r) => r.IsHighPatho).length,
      urgent: allResults.filter((r) => r.IsEmergency).length,
    };
  }, [counter, allResults]);

  const tabs: { key: ResultCategory; label: string; count: number; color: string }[] = [
    { key: 'all', label: t('results.tabs.all'), count: counts.all, color: '#000000' },
    { key: 'unread', label: t('results.tabs.unread'), count: counts.unread, color: '#000000' },
    { key: 'pathological', label: t('results.tabs.pathological'), count: counts.pathological, color: '#F59E0B' },
    { key: 'highPatho', label: t('results.tabs.highPatho'), count: counts.highPatho, color: '#EF4444' },
    { key: 'urgent', label: t('results.tabs.urgent'), count: counts.urgent, color: '#EF4444' },
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
                placeholder={t('results.searchPlaceholder')}
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
              <IonTitle className="ion-text-center">{t('results.title')} - {periodTitles[effectivePeriod]}</IonTitle>
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

      <IonContent scrollEvents onIonScroll={handleScroll}>
        <PullToRefresh onRefresh={handleRefresh} />

        {showSkeleton ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 16px' }}>
            <TestTubeLoader size={80} />
          </div>
        ) : !filteredResults.length ? (
          <EmptyState
            type="results"
            title={t('results.noFilterResults')}
            message={t('results.tryDifferentFilter')}
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
{/* Load more trigger */}
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
              {isFetchingNextPage && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--ion-color-medium)' }}>
                  <TestTubeLoader size={40} />
                  <span>{t('common.loadingMore')}</span>
                </div>
              )}
              {!hasNextPage && allResults.length > 0 && !isFetchingNextPage && (
                <span style={{ fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                  {category !== 'all' || searchQuery
                    ? t('results.showingFiltered', { shown: filteredResults.length, total: allResults.length })
                    : t('results.allLoaded', { count: allResults.length })}
                </span>
              )}
            </div>
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
