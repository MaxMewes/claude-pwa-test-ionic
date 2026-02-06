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
  businessOutline,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSender } from '../hooks/useSenders';

export const SenderDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: sender, isLoading } = useSender(id ? parseInt(id, 10) : undefined);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getFullName = () => {
    if (!sender) return '';
    return `${sender.Firstname} ${sender.Lastname}`.trim();
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
          <IonTitle>{getFullName()}</IonTitle>
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
                color: 'var(--ion-color-primary-contrast)',
                fontSize: '28px',
                fontWeight: 600,
              }}
            >
              {getInitials(sender.Firstname, sender.Lastname)}
            </div>
          </IonAvatar>
          <h2 style={{ margin: '0 0 4px 0' }}>{getFullName()}</h2>
        </div>

        {/* Site Info */}
        {sender.Site?.Name && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '16px' }}>
                <IonIcon icon={businessOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {t('senders.practice')}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ margin: 0 }}>{sender.Site.Name}</p>
            </IonCardContent>
          </IonCard>
        )}

        {/* Contact */}
        {sender.Contact && (
          <IonList>
            {sender.Contact.Phone && (
              <IonItem button href={`tel:${sender.Contact.Phone}`}>
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>
                  <p>{t('senders.phone')}</p>
                  <h2>{sender.Contact.Phone}</h2>
                </IonLabel>
              </IonItem>
            )}
            {sender.Contact.Mobile && (
              <IonItem button href={`tel:${sender.Contact.Mobile}`}>
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>
                  <p>{t('senders.mobile')}</p>
                  <h2>{sender.Contact.Mobile}</h2>
                </IonLabel>
              </IonItem>
            )}
            {sender.Contact.Email && (
              <IonItem button href={`mailto:${sender.Contact.Email}`}>
                <IonIcon icon={mailOutline} slot="start" color="primary" />
                <IonLabel>
                  <p>{t('senders.email')}</p>
                  <h2>{sender.Contact.Email}</h2>
                </IonLabel>
              </IonItem>
            )}
          </IonList>
        )}

        {/* Address */}
        {sender.Site?.Address && (
          <IonList>
            <IonItem>
              <IonIcon icon={locationOutline} slot="start" color="primary" />
              <IonLabel>
                <p>{t('senders.address')}</p>
                <h2>{sender.Site.Address.Street}</h2>
                <p>{sender.Site.Address.Zip} {sender.Site.Address.City}</p>
              </IonLabel>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
