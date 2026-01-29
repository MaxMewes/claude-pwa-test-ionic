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
} from '@ionic/react';
import { searchOutline, closeOutline, barcodeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResults, useResultCounter, useMarkResultAsRead } from '../hooks/useResults';
import { useSettingsStore } from '../../../shared/store/useSettingsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { ResultCard } from '../components/ResultCard';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { LabResult } from '../../../api/types';

type ResultCategory = 'all' | 'unread' | 'pathological' | 'highPatho' | 'urgent';

export const ResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ResultCategory>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const { data, isLoading, refetch } = useResults();
  const { data: counter } = useResultCounter();
  const markAsRead = useMarkResultAsRead();
  const { selectedSender } = useAuthStore();
  const { isFavorite, toggleFavorite } = useSettingsStore();

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
    if (selectedSender?.Id) {
      toggleFavorite(selectedSender.Id, resultId);
    }
  };

  // Filter results based on category and search
  const filteredResults = useMemo(() => {
    let results = data?.Results || [];

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
  }, [data?.Results, category, searchQuery]);

  // Calculate counts for each category
  const counts = useMemo(() => {
    const results = data?.Results || [];
    return {
      all: results.length,
      unread: counter?.New || results.filter((r) => !r.IsRead).length,
      pathological: counter?.Pathological || results.filter((r) => r.IsPathological && !r.IsUrgent).length,
      highPatho: results.filter((r) => r.IsPathological && r.HasCriticalValues).length,
      urgent: results.filter((r) => r.IsUrgent).length,
    };
  }, [data?.Results, counter]);

  const tabs: { key: ResultCategory; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'Ungelesen', count: counts.all, color: 'medium' },
    { key: 'unread', label: 'Neu', count: counts.unread, color: 'primary' },
    { key: 'pathological', label: 'Patho', count: counts.pathological, color: 'warning' },
    { key: 'highPatho', label: 'Hochpatho.', count: counts.highPatho, color: 'danger' },
    { key: 'urgent', label: 'Notfall', count: counts.urgent, color: 'danger' },
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
            // Normal mode - show title and search icon
            <>
              <IonTitle>{t('results.title')}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleBarcodeScan}>
                  <IonIcon icon={barcodeOutline} />
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
          style={{
            '--background': 'var(--ion-background-color)',
            '--padding-top': '0',
            '--padding-bottom': '0',
            '--min-height': '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--labgate-border)',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '10px 4px',
                    border: 'none',
                    borderBottom: isActive
                      ? '2px solid var(--labgate-brand)'
                      : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: isActive ? 'var(--labgate-brand)' : 'var(--labgate-text-light)',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      style={{
                        backgroundColor:
                          tab.key === 'urgent' || tab.key === 'highPatho'
                            ? '#EF4444'
                            : tab.key === 'pathological'
                              ? '#F59E0B'
                              : tab.key === 'unread'
                                ? 'var(--labgate-brand)'
                                : 'var(--labgate-text-muted)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '8px',
                        minWidth: '16px',
                        textAlign: 'center',
                      }}
                    >
                      {tab.count > 99 ? '99+' : tab.count}
                    </span>
                  )}
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
            type={searchQuery ? 'search' : 'results'}
            title={
              category === 'unread' ? 'Keine neuen Befunde' :
              category === 'pathological' ? 'Keine pathologischen Befunde' :
              category === 'highPatho' ? 'Keine hochpathologischen Befunde' :
              category === 'urgent' ? 'Keine Notfall-Befunde' :
              undefined
            }
            message={
              category !== 'all' && !searchQuery
                ? 'Es gibt aktuell keine Befunde in dieser Kategorie.'
                : undefined
            }
            actionLabel={searchQuery ? t('common.reset') : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <IonList lines="none" style={{ padding: 0 }}>
            {filteredResults.map((result: LabResult) => (
              <ResultCard
                key={result.Id}
                result={result}
                isFavorite={selectedSender?.Id ? isFavorite(selectedSender.Id, result.Id) : false}
                onClick={() => handleResultClick(result.Id, result.IsRead)}
                onToggleFavorite={() => handleToggleFavorite(result.Id)}
              />
            ))}
          </IonList>
        )}
      </IonContent>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeResult}
      />
    </IonPage>
  );
};
