import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonMenuButton,
} from '@ionic/react';
import { searchOutline, closeOutline, maleOutline, femaleOutline, maleFemaleOutline, chevronForwardOutline } from 'ionicons/icons';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePatients } from '../hooks/usePatients';
import { PullToRefresh, SkeletonLoader, EmptyState } from '../../../shared/components';
import { Patient } from '../../../api/types';

// Colors matching the app design
const COLORS = {
  brand: '#70CC60',
  text: '#3C3C3B',
  textLight: '#646363',
  rowEven: '#F4F4F4',
  rowOdd: '#FFFFFF',
  border: '#E5E5E5',
};

export const PatientsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const { data: patients = [], isLoading, refetch } = usePatients({ search: search || undefined });

  // Focus searchbar when opening
  useEffect(() => {
    if (isSearchOpen && searchbarRef.current) {
      setTimeout(() => {
        searchbarRef.current?.setFocus();
      }, 100);
    }
  }, [isSearchOpen]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearch('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const handlePatientClick = (patientId: string | number) => {
    history.push(`/patients/${patientId}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Helper to get values from either PascalCase (API v3) or camelCase (legacy) fields
  const getPatientLastName = (patient: Patient) => patient.Lastname ?? patient.lastName ?? '';
  const getPatientFirstName = (patient: Patient) => patient.Firstname ?? patient.firstName ?? '';
  const getPatientId = (patient: Patient) => patient.Id ?? patient.id ?? 0;
  const getPatientDateOfBirth = (patient: Patient) => patient.DateOfBirth ?? patient.dateOfBirth;
  const getPatientGender = (patient: Patient) => patient.Gender ?? patient.gender;

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | undefined): number | null => {
    if (!dateOfBirth) return null;
    try {
      return differenceInYears(new Date(), new Date(dateOfBirth));
    } catch {
      return null;
    }
  };

  // Format date of birth
  const formatDateOfBirth = (dateOfBirth: string | undefined): string => {
    if (!dateOfBirth) return '';
    try {
      return format(new Date(dateOfBirth), 'dd.MM.yyyy', { locale: de });
    } catch {
      return '';
    }
  };

  // Get gender icon and color
  const getGenderDisplay = (gender: string | number | undefined) => {
    // API v3 uses numbers: 1=female, 2=male, or strings: 'Female', 'Male', 'Diverse'
    if (gender === 2 || gender === 'Male' || gender === 'male') {
      return { icon: maleOutline, color: '#3B82F6' }; // Blue
    }
    if (gender === 1 || gender === 'Female' || gender === 'female') {
      return { icon: femaleOutline, color: '#EC4899' }; // Pink
    }
    if (gender === 'Diverse' || gender === 'other') {
      return { icon: maleFemaleOutline, color: '#8B5CF6' }; // Purple
    }
    return null;
  };

  // Group patients alphabetically by last name
  const groupedPatients = useMemo(() => {
    if (!patients.length) return {};

    const groups: Record<string, Patient[]> = {};
    const sortedPatients = [...patients].sort((a, b) => {
      const lastNameA = getPatientLastName(a);
      const lastNameB = getPatientLastName(b);
      return lastNameA.localeCompare(lastNameB);
    });

    for (const patient of sortedPatients) {
      const lastName = getPatientLastName(patient);
      const firstLetter = lastName.charAt(0).toUpperCase() || '#';
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(patient);
    }

    return groups;
  }, [patients]);

  // Auto-expand all accordions when searching
  useEffect(() => {
    if (search && Object.keys(groupedPatients).length > 0) {
      setOpenAccordions(Object.keys(groupedPatients));
    }
  }, [search, groupedPatients]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {isSearchOpen ? (
            <>
              <IonSearchbar
                ref={searchbarRef}
                value={search}
                onIonInput={(e) => handleSearch(e.detail.value || '')}
                placeholder={t('patients.searchPlaceholder')}
                animated
                showCancelButton="never"
                style={{ '--background': 'var(--labgate-selected-bg)' }}
              />
              <IonButtons slot="end">
                <IonButton onClick={handleSearchToggle}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </>
          ) : (
            <>
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>
              <IonTitle className="ion-text-center">{t('patients.title')}</IonTitle>
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
        <PullToRefresh onRefresh={handleRefresh} />

        {isLoading ? (
          <SkeletonLoader type="list" count={10} />
        ) : !patients.length ? (
          <EmptyState
            type={search ? 'search' : 'patients'}
            actionLabel={search ? t('common.reset') : undefined}
            onAction={search ? () => setSearch('') : undefined}
          />
        ) : (
          <IonAccordionGroup
            multiple={true}
            value={openAccordions}
            onIonChange={(e) => setOpenAccordions(e.detail.value as string[])}
          >
            {Object.entries(groupedPatients).map(([letter, items]) => (
              <IonAccordion key={letter} value={letter}>
                <IonItem slot="header" color="light">
                  <IonLabel>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                      {letter}
                    </h2>
                    <p style={{ fontSize: '12px', color: COLORS.textLight, margin: '4px 0 0 0' }}>
                      {items.length} {items.length === 1 ? 'Patient' : 'Patienten'}
                    </p>
                  </IonLabel>
                </IonItem>
                <div slot="content" style={{ backgroundColor: '#FFFFFF' }}>
                  {items.map((patient, index) => {
                    const patientId = getPatientId(patient);
                    const firstName = getPatientFirstName(patient);
                    const lastName = getPatientLastName(patient);
                    const dateOfBirth = getPatientDateOfBirth(patient);
                    const age = calculateAge(dateOfBirth);
                    const formattedDob = formatDateOfBirth(dateOfBirth);
                    const genderDisplay = getGenderDisplay(getPatientGender(patient));

                    return (
                      <div
                        key={patientId}
                        onClick={() => handlePatientClick(patientId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          backgroundColor: index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd,
                          borderBottom: `1px solid ${COLORS.border}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '15px',
                              color: COLORS.text,
                              fontWeight: 500,
                            }}
                          >
                            {lastName}, {firstName}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '4px',
                              fontSize: '13px',
                              color: COLORS.textLight,
                            }}
                          >
                            {formattedDob && (
                              <span>
                                {formattedDob}
                                {age !== null && ` (${age} J.)`}
                              </span>
                            )}
                            {genderDisplay && (
                              <IonIcon
                                icon={genderDisplay.icon}
                                style={{
                                  fontSize: '16px',
                                  color: genderDisplay.color,
                                }}
                              />
                            )}
                          </div>
                        </div>
                        <IonIcon
                          icon={chevronForwardOutline}
                          style={{
                            fontSize: '20px',
                            color: COLORS.textLight,
                            marginLeft: '8px',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        )}
      </IonContent>
    </IonPage>
  );
};
