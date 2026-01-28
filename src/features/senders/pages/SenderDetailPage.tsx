import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonSkeletonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import {
  callOutline,
  mailOutline,
  locationOutline,
  medkitOutline,
  businessOutline,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSender } from '../hooks/useSenders';

export const SenderDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: sender, isLoading } = useSender(id);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/senders" />
            </IonButtons>
            <IonTitle>
              <IonSkeletonText animated style={{ width: '50%' }} />
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <IonSkeletonText animated style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto' }} />
            <IonSkeletonText animated style={{ width: '60%', margin: '16px auto' }} />
            <IonSkeletonText animated style={{ width: '40%', margin: '8px auto' }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!sender) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/senders" />
            </IonButtons>
            <IonTitle>{t('senders.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p>{t('errors.notFound')}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/senders" />
          </IonButtons>
          <IonTitle>{sender.fullName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Header Section */}
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--ion-color-light)' }}>
          <IonAvatar style={{ width: '80px', height: '80px', margin: '0 auto 16px' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--ion-color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '28px',
                fontWeight: 600,
              }}
            >
              {getInitials(sender.firstName, sender.lastName)}
            </div>
          </IonAvatar>
          <h2 style={{ margin: '0 0 4px 0' }}>{sender.fullName}</h2>
          {sender.specialField && (
            <p style={{ margin: 0, color: 'var(--ion-color-medium)' }}>{sender.specialField}</p>
          )}
        </div>

        {/* Site Info */}
        {sender.siteName && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '16px' }}>
                <IonIcon icon={businessOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {t('senders.practice')}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ margin: 0 }}>{sender.siteName}</p>
              {sender.customerNo && (
                <p style={{ margin: '8px 0 0', color: 'var(--ion-color-medium)', fontSize: '14px' }}>
                  {t('senders.customerNo')}: {sender.customerNo}
                </p>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {/* Contact */}
        {sender.contact && (
          <IonList>
            {sender.contact.phone && (
              <IonItem button href={`tel:${sender.contact.phone}`}>
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>
                  <p>{t('senders.phone')}</p>
                  <h2>{sender.contact.phone}</h2>
                </IonLabel>
              </IonItem>
            )}
            {sender.contact.mobile && (
              <IonItem button href={`tel:${sender.contact.mobile}`}>
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>
                  <p>{t('senders.mobile')}</p>
                  <h2>{sender.contact.mobile}</h2>
                </IonLabel>
              </IonItem>
            )}
            {sender.contact.email && (
              <IonItem button href={`mailto:${sender.contact.email}`}>
                <IonIcon icon={mailOutline} slot="start" color="primary" />
                <IonLabel>
                  <p>{t('senders.email')}</p>
                  <h2>{sender.contact.email}</h2>
                </IonLabel>
              </IonItem>
            )}
          </IonList>
        )}

        {/* Address */}
        {sender.address && (
          <IonList>
            <IonItem>
              <IonIcon icon={locationOutline} slot="start" color="primary" />
              <IonLabel>
                <p>{t('senders.address')}</p>
                <h2>{sender.address.street}</h2>
                <p>{sender.address.zipCode} {sender.address.city}</p>
              </IonLabel>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
