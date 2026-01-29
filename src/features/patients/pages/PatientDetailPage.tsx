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

  // Helper to get values from either PascalCase (API v3) or camelCase (legacy) fields
  const firstName = patient.Firstname ?? patient.firstName ?? '';
  const lastName = patient.Lastname ?? patient.lastName ?? '';
  const dateOfBirth = patient.DateOfBirth ?? patient.dateOfBirth ?? '';
  const gender = patient.Gender === 1 ? 'female' : patient.Gender === 2 ? 'male' : (patient.gender ?? 'other');
  const resultCount = patient.ResultCount ?? patient.resultCount ?? 0;
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  const age = dateOfBirth ? differenceInYears(new Date(), new Date(dateOfBirth)) : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.PATIENTS} />
          </IonButtons>
          <IonTitle>{lastName}, {firstName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Patient Header Card - with gender-based colors */}
        <IonCard>
          <IonCardContent>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor:
                    gender === 'male'
                      ? 'var(--gender-male)'
                      : gender === 'female'
                        ? 'var(--gender-female)'
                        : 'var(--gender-other)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
              <h2 style={{
                margin: '0 0 4px 0',
                color: 'var(--labgate-text)',
                fontWeight: 600,
                fontSize: '18px'
              }}>
                {firstName} {lastName}
              </h2>
              <p style={{
                margin: 0,
                color: 'var(--labgate-text-light)',
                fontSize: '14px'
              }}>
                {t(`patients.gender.${gender}`)} • {age} Jahre
              </p>
            </div>

            <IonButton expand="block" onClick={handleViewResults}>
              <IonIcon slot="start" icon={documentTextOutline} />
              {resultCount} Befunde anzeigen
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Patient Details */}
        <IonList>
          {dateOfBirth && (
            <IonItem>
              <IonIcon icon={calendarOutline} slot="start" color="primary" />
              <IonLabel>
                <p>{t('patients.dateOfBirth')}</p>
                <h2>{format(new Date(dateOfBirth), 'dd.MM.yyyy', { locale: de })}</h2>
              </IonLabel>
            </IonItem>
          )}

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
            <div className="list-group-header">
              {t('patients.contact')}
            </div>
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
            <div className="list-group-header">
              {t('patients.address')}
            </div>
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
