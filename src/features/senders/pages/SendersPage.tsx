import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonSkeletonText,
  IonText,
  IonNote,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSenders } from '../hooks/useSenders';

export const SendersPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const { senders, isLoading, refetch } = useSenders({ query: searchQuery });

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('senders.title')}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value || '')}
            placeholder={t('common.search')}
            debounce={300}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading ? (
          <IonList>
            {[...Array(5)].map((_, i) => (
              <IonItem key={i}>
                <IonAvatar slot="start">
                  <IonSkeletonText animated />
                </IonAvatar>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                  <IonSkeletonText animated style={{ width: '40%' }} />
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : !senders?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <IonText color="medium">
              <p>{t('senders.noSenders')}</p>
            </IonText>
          </div>
        ) : (
          <IonList>
            {senders.map((sender) => (
              <IonItem
                key={sender.Id}
                button
                onClick={() => history.push(`/senders/${sender.Id}`)}
                detail
              >
                <IonAvatar slot="start">
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'var(--labgate-brand)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--labgate-brand-text-on-brand)',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    {getInitials(sender.Firstname, sender.Lastname)}
                  </div>
                </IonAvatar>
                <IonLabel>
                  <h2>{`${sender.Firstname} ${sender.Lastname}`.trim()}</h2>
                  {sender.Site?.Name && (
                    <IonNote>{sender.Site.Name}</IonNote>
                  )}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
