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
  IonSearchbar,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { searchOutline, closeOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useFAQ } from '../hooks/useFAQ';
import { SkeletonLoader, EmptyState } from '../../../shared/components';

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: faqs, isLoading, error } = useFAQ();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

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

  // Filter FAQs by search query
  const filteredFAQs = useMemo(() => {
    if (!faqs?.length) return [];
    if (!searchQuery) return faqs;

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.Question.toLowerCase().includes(query) ||
        faq.Answer.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>{t('help.faqTitle')}</IonTitle>
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
            <IonTitle>{t('help.faqTitle')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <EmptyState
            type="error"
            title={t('help.faqLoadError')}
            message={t('help.faqLoadErrorMessage')}
          />
        </IonContent>
      </IonPage>
    );
  }

  const hasResults = filteredFAQs.length > 0;

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
                placeholder={t('help.searchFAQ')}
                animated
                showCancelButton="never"
              />
              <IonButtons slot="end">
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </>
          ) : (
            <>
              <IonTitle>{t('help.faqTitle')}</IonTitle>
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
            title={searchQuery ? t('emptyState.search.title') : t('help.noFAQAvailable')}
            message={
              searchQuery
                ? t('help.noMatchingEntries')
                : t('help.noEntriesAvailable')
            }
            actionLabel={searchQuery ? t('help.resetSearch') : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <IonList lines="none">
            <IonAccordionGroup>
              {filteredFAQs.map((faq) => (
                <IonAccordion key={faq.Id} value={String(faq.Id)}>
                  <IonItem slot="header" color="light">
                    <IonLabel
                      style={{
                        whiteSpace: 'normal',
                        fontSize: '15px',
                        fontWeight: '500',
                      }}
                    >
                      {faq.Question}
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
                      {faq.Answer}
                    </p>
                  </div>
                </IonAccordion>
              ))}
            </IonAccordionGroup>
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
