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
} from '@ionic/react';
import {
  personOutline,
  calendarOutline,
  callOutline,
  mailOutline,
  locationOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { usePatient } from '../hooks/usePatients';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

export const PatientDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { data: patient, isLoading } = usePatient(id);

  const handleViewResults = () => {
    history.push(`${ROUTES.RESULTS}?patientId=${id}`);
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.PATIENTS} />
            </IonButtons>
            <IonTitle>{t('patients.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SkeletonLoader type="detail" />
        </IonContent>
      </IonPage>
    );
  }

  if (!patient) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={ROUTES.PATIENTS} />
            </IonButtons>
            <IonTitle>{t('patients.detail')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="medium">Patient nicht gefunden</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.PATIENTS} />
          </IonButtons>
          <IonTitle>{patient.lastName}, {patient.firstName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Patient Header Card */}
        <IonCard>
          <IonCardContent>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--ion-color-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: 600,
                }}
              >
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <IonText color="dark">
                <h2 style={{ margin: '0 0 4px 0' }}>
                  {patient.firstName} {patient.lastName}
                </h2>
              </IonText>
              <IonText color="medium">
                <p style={{ margin: 0 }}>
                  {t(`patients.gender.${patient.gender}`)} • {age} Jahre
                </p>
              </IonText>
            </div>

            <IonButton expand="block" onClick={handleViewResults}>
              <IonIcon slot="start" icon={documentTextOutline} />
              {patient.resultCount} Befunde anzeigen
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Patient Details */}
        <IonList>
          <IonItem>
            <IonIcon icon={calendarOutline} slot="start" color="primary" />
            <IonLabel>
              <p>{t('patients.dateOfBirth')}</p>
              <h2>{format(new Date(patient.dateOfBirth), 'dd.MM.yyyy', { locale: de })}</h2>
            </IonLabel>
          </IonItem>

          {patient.insuranceNumber && (
            <IonItem>
              <IonIcon icon={personOutline} slot="start" color="primary" />
              <IonLabel>
                <p>{t('patients.insuranceNumber')}</p>
                <h2>{patient.insuranceNumber}</h2>
              </IonLabel>
            </IonItem>
          )}

          {patient.lastVisit && (
            <IonItem>
              <IonIcon icon={calendarOutline} slot="start" color="primary" />
              <IonLabel>
                <p>{t('patients.lastVisit')}</p>
                <h2>{format(new Date(patient.lastVisit), 'dd.MM.yyyy', { locale: de })}</h2>
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        {/* Contact Section */}
        {(patient.phone || patient.email) && (
          <>
            <IonItem lines="none" color="light">
              <IonLabel>
                <h2 style={{ fontWeight: 600 }}>{t('patients.contact')}</h2>
              </IonLabel>
            </IonItem>
            <IonList>
              {patient.phone && (
                <IonItem button href={`tel:${patient.phone}`}>
                  <IonIcon icon={callOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{patient.phone}</h2>
                  </IonLabel>
                </IonItem>
              )}
              {patient.email && (
                <IonItem button href={`mailto:${patient.email}`}>
                  <IonIcon icon={mailOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h2>{patient.email}</h2>
                  </IonLabel>
                </IonItem>
              )}
            </IonList>
          </>
        )}

        {/* Address Section */}
        {patient.address && (
          <>
            <IonItem lines="none" color="light">
              <IonLabel>
                <h2 style={{ fontWeight: 600 }}>{t('patients.address')}</h2>
              </IonLabel>
            </IonItem>
            <IonList>
              <IonItem>
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>
                  <h2>{patient.address.street}</h2>
                  <p>
                    {patient.address.postalCode} {patient.address.city}
                  </p>
                  <p>{patient.address.country}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
