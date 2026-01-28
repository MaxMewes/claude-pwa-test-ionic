import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonButton,
  IonChip,
} from '@ionic/react';
import {
  callOutline,
  mailOutline,
  locationOutline,
  globeOutline,
  timeOutline,
  navigateOutline,
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLaboratory } from '../hooks/useLaboratories';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

export const LaboratoryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: lab, isLoading } = useLaboratory(id);

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.LABORATORIES} />
            </IonButtons>
            <IonTitle>{t('laboratories.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="detail" />
        </IonContent>
      </IonPage>
    );
  }

  if (!lab) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.LABORATORIES} />
            </IonButtons>
            <IonTitle>{t('laboratories.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="medium">Labor nicht gefunden</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const handleOpenMaps = () => {
    const { latitude, longitude, street, city, postalCode } = lab.address;
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    } else {
      const address = encodeURIComponent(`${street}, ${postalCode} ${city}`);
      window.open(`https://www.google.com/maps?q=${address}`, '_blank');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.LABORATORIES} />
          </IonButtons>
          <IonTitle>{lab.shortName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Laboratory Header Card */}
        <IonCard>
          <IonCardContent>
            <IonText color="dark">
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{lab.name}</h2>
            </IonText>
            <IonText color="medium">
              <p style={{ margin: 0 }}>
                {lab.address.street}, {lab.address.postalCode} {lab.address.city}
              </p>
            </IonText>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <IonButton expand="block" onClick={handleOpenMaps}>
                <IonIcon slot="start" icon={navigateOutline} />
                {t('laboratories.directions')}
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Contact Section */}
        <IonItem lines="none" color="light">
          <IonLabel>
            <h2 style={{ fontWeight: 600 }}>{t('laboratories.contact')}</h2>
          </IonLabel>
        </IonItem>
        <IonList>
          <IonItem button href={`tel:${lab.phone}`}>
            <IonIcon icon={callOutline} slot="start" color="primary" />
            <IonLabel>
              <p>Telefon</p>
              <h2>{lab.phone}</h2>
            </IonLabel>
          </IonItem>

          {lab.fax && (
            <IonItem>
              <IonIcon icon={callOutline} slot="start" color="primary" />
              <IonLabel>
                <p>Fax</p>
                <h2>{lab.fax}</h2>
              </IonLabel>
            </IonItem>
          )}

          <IonItem button href={`mailto:${lab.email}`}>
            <IonIcon icon={mailOutline} slot="start" color="primary" />
            <IonLabel>
              <p>E-Mail</p>
              <h2>{lab.email}</h2>
            </IonLabel>
          </IonItem>

          {lab.website && (
            <IonItem button href={lab.website} target="_blank">
              <IonIcon icon={globeOutline} slot="start" color="primary" />
              <IonLabel>
                <p>Website</p>
                <h2>{lab.website}</h2>
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        {/* Opening Hours Section */}
        <IonItem lines="none" color="light">
          <IonLabel>
            <h2 style={{ fontWeight: 600 }}>{t('laboratories.openingHours')}</h2>
          </IonLabel>
        </IonItem>
        <IonList>
          {lab.openingHours.map((hours) => (
            <IonItem key={hours.day}>
              <IonIcon icon={timeOutline} slot="start" color="primary" />
              <IonLabel>
                <h2>{hours.day}</h2>
              </IonLabel>
              <IonText slot="end" color={hours.isClosed ? 'medium' : 'dark'}>
                {hours.isClosed ? t('laboratories.closed') : `${hours.open} - ${hours.close}`}
              </IonText>
            </IonItem>
          ))}
        </IonList>

        {/* Services Section */}
        <IonItem lines="none" color="light">
          <IonLabel>
            <h2 style={{ fontWeight: 600 }}>{t('laboratories.services')}</h2>
          </IonLabel>
        </IonItem>
        <div style={{ padding: '8px 16px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {lab.services.map((service) => (
              <IonChip key={service} color="primary" outline>
                {service}
              </IonChip>
            ))}
          </div>
        </div>

        {/* Address Section */}
        <IonItem lines="none" color="light">
          <IonLabel>
            <h2 style={{ fontWeight: 600 }}>Adresse</h2>
          </IonLabel>
        </IonItem>
        <IonList>
          <IonItem button onClick={handleOpenMaps}>
            <IonIcon icon={locationOutline} slot="start" color="primary" />
            <IonLabel>
              <h2>{lab.address.street}</h2>
              <p>
                {lab.address.postalCode} {lab.address.city}
              </p>
              <p>{lab.address.country}</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
