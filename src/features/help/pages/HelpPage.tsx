import React, { useState, useMemo } from 'react';
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
  IonSearchbar,
  IonAccordion,
  IonAccordionGroup,
  IonSkeletonText,
  IonText,
  IonButtons,
  IonBackButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/react';
import {
  helpCircleOutline,
  informationCircleOutline,
  shieldCheckmarkOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFAQ } from '../../settings/hooks/useFAQ';
import { FAQ } from '../../../api/types';

export const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFAQ();

  // Flatten paginated results
  const faqs = useMemo(() => {
    return data?.pages?.flatMap((page) => page.Results) || [];
  }, [data]);

  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faqs, searchQuery]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    return filteredFAQs.reduce((acc: Record<string, FAQ[]>, faq) => {
      const category = faq.category || 'Allgemein';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FAQ[]>);
  }, [filteredFAQs]);

  // Handle infinite scroll
  const handleLoadMore = async (event: CustomEvent<void>) => {
    if (hasNextPage) {
      await fetchNextPage();
    }
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
          </IonButtons>
          <IonTitle>{t('settings.support.title')}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value || '')}
            placeholder={t('help.searchFAQ')}
            debounce={300}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Quick Links */}
        <IonList>
          <IonItem button onClick={() => history.push('/help/about')}>
            <IonIcon icon={informationCircleOutline} slot="start" color="primary" />
            <IonLabel>{t('help.about')}</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/help/privacy')}>
            <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
            <IonLabel>{t('settings.privacy.title')}</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/help/feedback')}>
            <IonIcon icon={chatbubbleOutline} slot="start" color="primary" />
            <IonLabel>{t('help.feedback')}</IonLabel>
          </IonItem>
        </IonList>

        {/* FAQ Section */}
        <div style={{ padding: '16px 16px 8px' }}>
          <IonText color="medium">
            <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase' }}>
              <IonIcon icon={helpCircleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {t('help.faq')}
            </h3>
          </IonText>
        </div>

        {isLoading ? (
          <IonList>
            {[...Array(5)].map((_, i) => (
              <IonItem key={i}>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: '80%' }} />
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : filteredFAQs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <IonText color="medium">
              <p>{t('help.noFAQs')}</p>
            </IonText>
          </div>
        ) : (
          <>
            <IonAccordionGroup>
              {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
                <React.Fragment key={category}>
                  <div style={{ padding: '8px 16px', backgroundColor: 'var(--ion-color-light)' }}>
                    <IonText color="medium" style={{ fontSize: '12px', fontWeight: 600 }}>
                      {category}
                    </IonText>
                  </div>
                  {categoryFAQs.map((faq) => (
                    <IonAccordion key={faq.id} value={faq.id}>
                      <IonItem slot="header">
                        <IonLabel className="ion-text-wrap">{faq.question}</IonLabel>
                      </IonItem>
                      <div slot="content" style={{ padding: '16px', backgroundColor: 'var(--ion-color-light)' }}>
                        <IonText>
                          <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{faq.answer}</p>
                        </IonText>
                      </div>
                    </IonAccordion>
                  ))}
                </React.Fragment>
              ))}
            </IonAccordionGroup>
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
