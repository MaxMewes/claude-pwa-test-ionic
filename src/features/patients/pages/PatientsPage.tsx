import React, { useState, useCallback } from 'react';
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
  IonBadge,
  IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { usePatients } from '../hooks/usePatients';
import { SearchInput, PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { Patient } from '../../../api/types';

export const PatientsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = usePatients({ search: search || undefined });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handlePatientClick = (patientId: string) => {
    history.push(`/patients/${patientId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Helper to get values from either PascalCase (API v3) or camelCase (legacy) fields
  const getPatientFirstName = (patient: Patient) => patient.Firstname ?? patient.firstName ?? '';
  const getPatientLastName = (patient: Patient) => patient.Lastname ?? patient.lastName ?? '';
  const getPatientId = (patient: Patient) => String(patient.Id ?? patient.id ?? '');
  const getPatientDOB = (patient: Patient) => patient.DateOfBirth ?? patient.dateOfBirth ?? '';
  const getPatientGender = (patient: Patient) => {
    // API v3 uses numbers: 1=female, 2=male
    if (patient.Gender === 1) return 'female';
    if (patient.Gender === 2) return 'male';
    return patient.gender ?? 'other';
  };
  const getPatientResultCount = (patient: Patient) => patient.ResultCount ?? patient.resultCount ?? 0;

  const getInitials = (patient: Patient) => {
    const first = getPatientFirstName(patient)?.[0] || '';
    const last = getPatientLastName(patient)?.[0] || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('patients.title')}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <SearchInput onSearch={handleSearch} placeholder="Patient suchen..." />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="list" count={5} />
        ) : !data?.Results?.length ? (
          <EmptyState
            type={search ? 'search' : 'patients'}
            actionLabel={search ? t('common.reset') : undefined}
            onAction={search ? () => setSearch('') : undefined}
          />
        ) : (
          <IonList>
            {data.Results.map((patient) => {
              const patientId = getPatientId(patient);
              const firstName = getPatientFirstName(patient);
              const lastName = getPatientLastName(patient);
              const dob = getPatientDOB(patient);
              const gender = getPatientGender(patient);
              const resultCount = getPatientResultCount(patient);

              return (
                <IonItem
                  key={patientId}
                  button
                  onClick={() => handlePatientClick(patientId)}
                  detail
                >
                  <IonAvatar slot="start">
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: gender === 'male'
                          ? 'var(--gender-male)'
                          : gender === 'female'
                            ? 'var(--gender-female)'
                            : 'var(--gender-other)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '16px',
                      }}
                    >
                      {getInitials(patient)}
                    </div>
                  </IonAvatar>

                  <IonLabel>
                    <h2 style={{ fontWeight: 500 }}>
                      {lastName}, {firstName}
                    </h2>
                    <p>
                      {t(`patients.gender.${gender}`)} • {getAge(dob)} Jahre
                    </p>
                    {patient.insuranceNumber && (
                      <p>
                        <IonText color="medium">
                          {t('patients.insuranceNumber')}: {patient.insuranceNumber}
                        </IonText>
                      </p>
                    )}
                  </IonLabel>

                  <div slot="end" style={{ textAlign: 'right' }}>
                    <IonBadge color="primary">{resultCount}</IonBadge>
                    <IonText color="medium" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      Befunde
                    </IonText>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
