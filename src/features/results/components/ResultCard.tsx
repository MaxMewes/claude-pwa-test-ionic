import React, { useState, useCallback } from 'react';
import { IonItem, IonIcon } from '@ionic/react';
import { star, starOutline, male, female } from 'ionicons/icons';
import { format, differenceInYears } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { LabResult } from '../../../api/types';
import styles from './ResultCard.module.css';

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

// Get patient gender icon (1 = female, 2 = male)
const getGenderIcon = (gender?: number): typeof male | typeof female | null => {
  if (gender === 1) return female;
  if (gender === 2) return male;
  return null;
};

/**
 * ResultCard component displays a lab result in a list format.
 *
 * @component
 * @example
 * ```tsx
 * <ResultCard
 *   result={labResult}
 *   isFavorite={true}
 *   onClick={() => navigate('/result/123')}
 *   onToggleFavorite={() => toggleFavorite(123)}
 * />
 * ```
 */
export const ResultCard = React.memo<ResultCardProps>(({ result, isFavorite = false, onClick, onToggleFavorite, selected }) => {
  const { t, i18n } = useTranslation();
  const [isStarAnimating, setIsStarAnimating] = useState(false);

  const handleToggleFavorite = useCallback(() => {
    setIsStarAnimating(true);
    onToggleFavorite?.();
    // Reset animation after it completes
    setTimeout(() => setIsStarAnimating(false), 400);
  }, [onToggleFavorite]);

  // Use appropriate locale for date formatting
  const locale = i18n.language === 'de' ? de : undefined;

  // Format date of birth with age (like old app: "DD.MM.YYYY (Age J.)")
  const formatDobWithAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return '';
    try {
      const dob = new Date(dateOfBirth);
      const age = calculateAge(dateOfBirth);
      const formattedDob = format(dob, 'dd.MM.yyyy', { locale });
      return age !== null ? `${formattedDob} (${age} ${t('resultCard.years')})` : formattedDob;
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
        return format(date, 'dd.MM.yyyy', { locale });
      }
      return format(date, 'dd.MM.yyyy HH:mm', { locale });
    } catch {
      return dateStr;
    }
  };

  const patientName = result.Patient?.Fullname ||
    `${result.Patient?.Lastname || ''}, ${result.Patient?.Firstname || ''}`.trim() ||
    t('resultCard.patient');

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
      aria-label={`${patientName}, ${result.LabNo}, ${reportDateDisplay}${result.IsRead ? '' : `, ${t('resultCard.unread')}`}`}
      className={`${styles.resultItem} ${selected ? styles.selected : ''}`}
    >
      {/* Left Pathological/Urgent Indicator Bar (like old app - 12px red bar) */}
      <div
        aria-hidden="true"
        className={`${styles.pathoBar} ${showPathoBar ? styles.active : ''}`}
      />

      {/* Result Type Letter - like old app */}
      <div aria-hidden="true" className={styles.typeLetter}>
        {typeLetter}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Row 1: Patient Name + Right side (star, ident, date) */}
        <div className={styles.topRow}>
          {/* Patient Name with unread indicator (green dot like old app) */}
          <div className={styles.patientNameContainer}>
            {!result.IsRead && (
              <span
                aria-label={t('resultCard.unread')}
                className={styles.unreadDot}
              />
            )}
            <span className={`${styles.patientName} ${!result.IsRead ? styles.unread : ''}`}>
              {patientName}
            </span>
          </div>

          {/* Right side: Star + Ident + Date (stacked like old app) */}
          <div className={styles.rightSection}>
            {/* Top: Star icon + Lab Number */}
            <div className={styles.topRightRow}>
              {/* Favorite Star - clickable (orange #E18B05 like old app) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggleFavorite();
                }}
                aria-label={`${t('resultCard.toggleFavorite')}: ${patientName}`}
                aria-pressed={isFavorite}
                className={styles.favoriteButton}
              >
                <IonIcon
                  icon={isFavorite ? star : starOutline}
                  aria-hidden="true"
                  className={`${styles.favoriteIcon} ${isFavorite ? styles.active : ''} ${isStarAnimating ? 'favorite-star-animate' : ''}`}
                />
              </button>

              {/* Lab Number / Ident */}
              <span className={`${styles.labNumber} ${!result.IsRead ? styles.unread : ''}`}>
                {result.LabNo}
              </span>
            </div>

            {/* Bottom: Report Date */}
            <span className={styles.reportDate}>
              {reportDateDisplay}
            </span>
          </div>
        </div>

        {/* Row 2: DOB, Age, Gender (like old app) */}
        <div className={`${styles.bottomRow} ${!result.IsRead ? styles.withUnreadDot : ''}`}>
          {dobDisplay && (
            <span className={styles.dateOfBirth}>
              {dobDisplay}
            </span>
          )}
          {genderIcon && (
            <IonIcon
              icon={genderIcon}
              aria-hidden="true"
              className={styles.genderIcon}
            />
          )}
          {/* Laboratory name on the right */}
          {result.Laboratory?.Name && (
            <span className={styles.labName}>
              {result.Laboratory.Name}
            </span>
          )}
        </div>
      </div>
    </IonItem>
  );
});

ResultCard.displayName = 'ResultCard';
