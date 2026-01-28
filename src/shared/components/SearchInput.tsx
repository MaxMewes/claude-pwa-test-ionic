import React, { useState, useCallback } from 'react';
import { IonSearchbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  onSearch: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder,
  debounceMs = 300,
  onSearch,
  onClear,
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
    <IonSearchbar
      value={searchValue}
      placeholder={placeholder || t('common.search')}
      debounce={debounceMs}
      onIonInput={handleChange}
      onIonClear={handleClear}
      showClearButton="focus"
      animated
    />
  );
};
