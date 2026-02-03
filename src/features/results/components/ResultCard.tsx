import React from 'react';
import { IonItem, IonIcon } from '@ionic/react';
import { star, starOutline, male, female } from 'ionicons/icons';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { LabResult } from '../../../api/types';

interface ResultCardProps {
  result: LabResult;
  isFavorite?: boolean; // From local storage
  onClick?: () => void;
  onToggleFavorite?: () => void;
  selected?: boolean;
}

// Result type display letter (like old app)
const getResultTypeLetter = (type?: string): string => {
  switch (type?.toUpperCase()) {
    case 'E': return 'E'; // Endbefund (Final)
    case 'T': return 'T'; // Teilbefund (Partial)
    case 'V': return 'V'; // Vorabmitteilung (Preliminary)
    case 'N': return 'N'; // Nachbericht (Follow-up)
    case 'A': return 'A'; // Archiv (Archived)
    default: return 'E';
  }
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;
  try {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  } catch {
    return null;
  }
};

// Format date of birth with age (like old app: "DD.MM.YYYY (Age J.)")
const formatDobWithAge = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return '';
  try {
    const dob = new Date(dateOfBirth);
    const age = calculateAge(dateOfBirth);
    const formattedDob = format(dob, 'dd.MM.yyyy', { locale: de });
    return age !== null ? `${formattedDob} (${age} J.)` : formattedDob;
  } catch {
    return '';
  }
};

// Format report date (omit time if 00:00)
const formatReportDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (hours === 0 && minutes === 0) {
      return format(date, 'dd.MM.yyyy', { locale: de });
    }
    return format(date, 'dd.MM.yyyy HH:mm', { locale: de });
  } catch {
    return dateStr;
  }
};

// Get patient gender icon (1 = female, 2 = male)
const getGenderIcon = (gender?: number): typeof male | typeof female | null => {
  if (gender === 1) return female;
  if (gender === 2) return male;
  return null;
};

export const ResultCard: React.FC<ResultCardProps> = ({ result, isFavorite = false, onClick, onToggleFavorite, selected }) => {
  const patientName = result.Patient?.Fullname ||
    `${result.Patient?.Lastname || ''}, ${result.Patient?.Firstname || ''}`.trim() ||
    'Patient';

  const typeLetter = getResultTypeLetter(result.ResultType);
  const dobDisplay = formatDobWithAge(result.Patient?.DateOfBirth);
  const reportDateDisplay = formatReportDate(result.ReportDate);
  const genderIcon = getGenderIcon((result.Patient as { Gender?: number })?.Gender);

  // Determine if pathological bar should show (red bar on left)
  const showPathoBar = result.IsPathological || result.IsUrgent || result.HasCriticalValues;

  return (
    <IonItem
      onClick={onClick}
      button
      detail={false}
      lines="full"
      style={{
        '--background': selected ? 'var(--labgate-selected-bg)' : 'var(--ion-background-color)',
        '--padding-start': '0',
        '--inner-padding-end': '12px',
        cursor: 'pointer',
      }}
    >
      {/* Left Pathological/Urgent Indicator Bar (like old app - 12px red bar) */}
      <div
        style={{
          width: '12px',
          minWidth: '12px',
          alignSelf: 'stretch',
          backgroundColor: showPathoBar ? 'var(--result-indicator-patho)' : 'transparent',
        }}
      />

      {/* Result Type Letter - like old app */}
      <div
        style={{
          width: '28px',
          minWidth: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--labgate-text)',
          marginLeft: '4px',
        }}
      >
        {typeLetter}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '10px 0', paddingLeft: '8px' }}>
        {/* Row 1: Patient Name + Right side (star, ident, date) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Patient Name with unread indicator (green dot like old app) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            {!result.IsRead && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--labgate-brand)',
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontWeight: result.IsRead ? 400 : 700, // Bold if unread like old app
                fontSize: '15px',
                color: 'var(--labgate-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {patientName}
            </span>
          </div>

          {/* Right side: Star + Ident + Date (stacked like old app) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, marginLeft: '8px' }}>
            {/* Top: Star icon + Lab Number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Favorite Star - clickable (orange #E18B05 like old app) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggleFavorite?.();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  margin: '-2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IonIcon
                  icon={isFavorite ? star : starOutline}
                  style={{
                    color: isFavorite ? 'var(--labgate-favorite)' : 'var(--labgate-text-muted)',
                    fontSize: '16px',
                  }}
                />
              </button>

              {/* Lab Number / Ident */}
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--labgate-text-light)', // Light text color from old app
                  fontWeight: result.IsRead ? 400 : 600,
                }}
              >
                {result.LabNo}
              </span>
            </div>

            {/* Bottom: Report Date */}
            <span
              style={{
                fontSize: '11px',
                color: 'var(--labgate-text-light)',
                marginTop: '2px',
              }}
            >
              {reportDateDisplay}
            </span>
          </div>
        </div>

        {/* Row 2: DOB, Age, Gender (like old app) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            paddingLeft: result.IsRead ? '0' : '14px', // Align with name when unread dot is present
          }}
        >
          {dobDisplay && (
            <span style={{ fontSize: '12px', color: 'var(--labgate-text-light)' }}>
              {dobDisplay}
            </span>
          )}
          {genderIcon && (
            <IonIcon
              icon={genderIcon}
              style={{ fontSize: '14px', color: 'var(--labgate-text-light)' }}
            />
          )}
          {/* Laboratory name on the right */}
          {result.Laboratory?.Name && (
            <span style={{ fontSize: '11px', color: 'var(--labgate-text-muted)', marginLeft: 'auto' }}>
              {result.Laboratory.Name}
            </span>
          )}
        </div>
      </div>
    </IonItem>
  );
};
