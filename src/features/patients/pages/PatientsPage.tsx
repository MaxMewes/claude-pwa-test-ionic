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

  const getInitials = (patient: Patient) => {
    return `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
  };

  const getAge = (dateOfBirth: string) => {
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
        ) : !data?.Items?.length ? (
          <EmptyState
            type={search ? 'search' : 'patients'}
            actionLabel={search ? t('common.reset') : undefined}
            onAction={search ? () => setSearch('') : undefined}
          />
        ) : (
          <IonList>
            {data.Items.map((patient) => (
              <IonItem
                key={patient.id}
                button
                onClick={() => handlePatientClick(patient.id)}
                detail
              >
                <IonAvatar slot="start">
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'var(--ion-color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(patient)}
                  </div>
                </IonAvatar>

                <IonLabel>
                  <h2 style={{ fontWeight: 500 }}>
                    {patient.lastName}, {patient.firstName}
                  </h2>
                  <p>
                    {t(`patients.gender.${patient.gender}`)} • {getAge(patient.dateOfBirth)} Jahre
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
                  <IonBadge color="primary">{patient.resultCount}</IonBadge>
                  <IonText color="medium" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    Befunde
                  </IonText>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
