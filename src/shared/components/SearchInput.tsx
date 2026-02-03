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
}

/**
 * SearchInput component with debouncing and accessibility features.
 * 
 * @component
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchTerm}
 *   onSearch={handleSearch}
 *   resultCount={results.length}
 * />
 * ```
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder,
  debounceMs = 300,
  onSearch,
  onClear,
  resultCount,
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
        aria-label={placeholder || t('common.search')}
      />
      {/* Screen reader announcement for search results */}
      {resultCount !== undefined && searchValue && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="ion-hide"
          style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px' }}
        >
          {resultCount} {resultCount === 1 ? 'result' : 'results'} found
        </div>
      )}
    </>
  );
};
