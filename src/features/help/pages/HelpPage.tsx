import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  IonButton,
} from '@ionic/react';
import {
  helpCircleOutline,
  informationCircleOutline,
  shieldCheckmarkOutline,
  chatbubbleOutline,
  searchOutline,
  closeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFAQ } from '../../settings/hooks/useFAQ';

export const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const { data: faqs, isLoading } = useFAQ();

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
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
              <IonTitle>{t('settings.support.title')}</IonTitle>
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
          <IonAccordionGroup>
            {filteredFAQs.map((faq) => (
              <IonAccordion key={faq.Id} value={String(faq.Id)}>
                <IonItem slot="header">
                  <IonLabel className="ion-text-wrap">{faq.Question}</IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '16px', backgroundColor: 'var(--ion-color-light)' }}>
                  <IonText>
                    <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{faq.Answer}</p>
                  </IonText>
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        )}
      </IonContent>
    </IonPage>
  );
};
