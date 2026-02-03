import React, { useState, useCallback } from 'react';
import { IonSearchbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  onSearch: (value: string) => void;
  onClear?: () => void;
  /** Number of search results for screen reader announcement */
  resultCount?: number;
  /** Aria label for the search input */
  ariaLabel?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder,
  debounceMs = 300,
  onSearch,
  onClear,
  resultCount,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(value);

  const handleChange = useCallback(
    (e: CustomEvent) => {
      const newValue = e.detail.value || '';
      setSearchValue(newValue);
      onSearch(newValue);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearch('');
    onClear?.();
  }, [onSearch, onClear]);

  // Generate screen reader announcement for search results
  const getResultAnnouncement = () => {
    if (resultCount === undefined || !searchValue) return '';
    if (resultCount === 0) return t('search.noResults', 'Keine Ergebnisse gefunden');
    if (resultCount === 1) return t('search.oneResult', '1 Ergebnis gefunden');
    return t('search.multipleResults', '{{count}} Ergebnisse gefunden', { count: resultCount });
  };

  return (
    <>
      <IonSearchbar
        value={searchValue}
        placeholder={placeholder || t('common.search')}
        debounce={debounceMs}
        onIonInput={handleChange}
        onIonClear={handleClear}
        showClearButton="focus"
        animated
        aria-label={ariaLabel || placeholder || t('common.search')}
      />
      {/* Screen reader announcement for search results */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {getResultAnnouncement()}
      </div>
    </>
  );
};
