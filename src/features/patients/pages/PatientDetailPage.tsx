import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonText,
  IonButton,
  IonFooter,
} from '@ionic/react';
import {
  personOutline,
  maleFemaleOutline,
  calendarOutline,
  locationOutline,
  peopleOutline,
  cardOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { usePatient } from '../hooks/usePatients';
import { SkeletonLoader } from '../../../shared/components';
import { ROUTES } from '../../../config/routes';

// Colors matching the app design
const COLORS = {
  brand: '#70CC60',
  text: '#3C3C3B',
  textLight: '#646363',
  border: '#E5E5E5',
};

export const PatientDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { data: patient, isLoading } = usePatient(id);

  const handleViewResults = () => {
    // Get patient name for search filter
    const patientFirstName = patient?.Firstname ?? patient?.firstName ?? '';
    const patientLastName = patient?.Lastname ?? patient?.lastName ?? '';
    const searchName = `${patientLastName}, ${patientFirstName}`.trim();
    const encodedName = encodeURIComponent(searchName);
    history.push(`${ROUTES.RESULTS}?search=${encodedName}`);
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
  const age = dateOfBirth ? differenceInYears(new Date(), new Date(dateOfBirth)) : null;
  const insurantId = patient.InsurantIdent ?? patient.insuranceNumber ?? '';
  const isHzvPatient = patient.IsHzvPatient ?? false;
  const address = patient.Address ?? patient.address;

  // Gender handling - API v3 uses string enum
  let genderDisplay = 'Unbekannt';
  let genderSymbol = '';
  if (patient.Gender === 'Male' || patient.Gender === 2) {
    genderDisplay = 'Männlich';
    genderSymbol = '♂';
  } else if (patient.Gender === 'Female' || patient.Gender === 1) {
    genderDisplay = 'Weiblich';
    genderSymbol = '♀';
  } else if (patient.Gender === 'Diverse') {
    genderDisplay = 'Divers';
    genderSymbol = '⚧';
  }

  // Format address
  let addressLine1 = '';
  let addressLine2 = '';
  if (address) {
    // Type guard: PatientStreetAddress has Street property
    const isStreetAddress = 'Street' in address || 'Zip' in address;
    const street = isStreetAddress 
      ? (address as import('../../../api/types').PatientStreetAddress).Street ?? ''
      : (address as import('../../../api/types').PatientAddressLegacy).street ?? '';
    const houseNumber = isStreetAddress
      ? (address as import('../../../api/types').PatientStreetAddress).HouseNumber ?? ''
      : '';
    const zip = isStreetAddress
      ? (address as import('../../../api/types').PatientStreetAddress).Zip ?? ''
      : (address as import('../../../api/types').PatientAddressLegacy).postalCode ?? '';
    const city = isStreetAddress
      ? (address as import('../../../api/types').PatientStreetAddress).City ?? ''
      : (address as import('../../../api/types').PatientAddressLegacy).city ?? '';
    const country = isStreetAddress
      ? (address as import('../../../api/types').PatientStreetAddress).CountryCode ?? ''
      : (address as import('../../../api/types').PatientAddressLegacy).country ?? '';

    addressLine1 = `${street} ${houseNumber}`.trim();
    addressLine2 = `${country ? country + ' - ' : ''}${zip} ${city}`.trim();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTES.PATIENTS} />
          </IonButtons>
          <IonTitle>Patient</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Patient Name Header */}
        <div
          style={{
            padding: '20px 16px',
            backgroundColor: COLORS.brand,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <IonIcon
            icon={personOutline}
            style={{
              fontSize: '32px',
              color: '#FFFFFF',
            }}
          />
          <div style={{ flex: 1, color: '#FFFFFF' }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              {lastName}, {firstName}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div style={{ backgroundColor: '#FFFFFF' }}>
          {/* Gender */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <IonIcon
              icon={maleFemaleOutline}
              style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>Geschlecht</div>
              <div style={{ fontSize: '15px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {genderDisplay}
                {genderSymbol && (
                  <span style={{ color: '#5DADE2', fontWeight: 'bold' }}>{genderSymbol}</span>
                )}
              </div>
            </div>
          </div>

          {/* Date of Birth */}
          {dateOfBirth && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <IonIcon
                icon={calendarOutline}
                style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: COLORS.textLight }}>Geburtsdatum</div>
                <div style={{ fontSize: '15px', color: COLORS.text }}>
                  {format(new Date(dateOfBirth), 'dd.MM.yyyy', { locale: de })}
                  {age !== null && ` (${age})`}
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {(addressLine1 || addressLine2) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '14px 16px',
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <IonIcon
                icon={locationOutline}
                style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px', marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: COLORS.textLight }}>Adresse</div>
                <div style={{ fontSize: '15px', color: COLORS.text }}>
                  {addressLine1 && <div>{addressLine1}</div>}
                  {addressLine2 && <div>{addressLine2}</div>}
                </div>
              </div>
            </div>
          )}

          {/* HzV Patient */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <IonIcon
              icon={peopleOutline}
              style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: COLORS.textLight }}>Ist HzV Patient</div>
              <div style={{ fontSize: '15px', color: COLORS.text }}>
                {isHzvPatient ? 'Ja' : 'Nein'}
              </div>
            </div>
          </div>

          {/* Insurant ID */}
          {insurantId && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <IonIcon
                icon={cardOutline}
                style={{ fontSize: '20px', color: COLORS.brand, marginRight: '12px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: COLORS.textLight }}>Versicherten-ID</div>
                <div style={{ fontSize: '15px', color: COLORS.text }}>{insurantId}</div>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <IonFooter style={{ '--background': 'transparent', '--border-width': '0', '--border-color': 'transparent', boxShadow: 'none' } as React.CSSProperties}>
        <div style={{ padding: '16px 16px 24px 16px', backgroundColor: 'transparent', boxShadow: 'none' }}>
          <IonButton
            expand="block"
            onClick={handleViewResults}
            style={{
              '--background': COLORS.brand,
              '--border-radius': '25px',
              '--box-shadow': 'none',
              boxShadow: 'none',
              fontWeight: 600,
              fontSize: '16px',
              height: '50px',
            }}
          >
            BEFUNDE ANZEIGEN
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};
