import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonText,
} from '@ionic/react';
import { pinOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline, starOutline, star } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { LabResult, TestResult } from '../../../api/types';

interface ResultCardProps {
  result: LabResult;
  onClick?: () => void;
}

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  partial: 'badge-partial',
  final: 'badge-final',
  corrected: 'badge-corrected',
};

// Map labGate API v3 pathology indicators to colors
const getPathologyColor = (test: TestResult): string => {
  if (!test.IsPathological) return 'var(--result-normal)';

  switch (test.PathologyIndicator) {
    case 'L':
    case 'LL':
      return 'var(--result-low)';
    case 'H':
    case 'HH':
      return 'var(--result-high)';
    case 'A':
      return 'var(--result-abnormal)';
    default:
      return test.IsPathological ? 'var(--result-high)' : 'var(--result-normal)';
  }
};

const isCritical = (test: TestResult): boolean => {
  return test.PathologyIndicator === 'LL' || test.PathologyIndicator === 'HH';
};

export const ResultCard: React.FC<ResultCardProps> = ({ result, onClick }) => {
  const { t } = useTranslation();

  // labGate API v3 uses ResultData array
  const tests = result.ResultData || [];

  const hasAbnormalValues = tests.some((test) => test.IsPathological);
  const hasCriticalValues = tests.some((test) => isCritical(test));

  // labGate API v3 status mapping
  const getStatusKey = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'final': return 'final';
      case 'partial': return 'partial';
      case 'pending': return 'pending';
      case 'corrected': return 'corrected';
      default: return 'final';
    }
  };

  const statusKey = getStatusKey(result.Status);

  return (
    <IonCard
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderLeft: hasCriticalValues
          ? '4px solid var(--result-critical)'
          : hasAbnormalValues
          ? '4px solid var(--result-high)'
          : '4px solid transparent',
        opacity: result.IsRead ? 0.85 : 1,
      }}
    >
      <IonCardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {/* labGate API v3 uses Patient.Fullname */}
            <IonCardTitle style={{ fontSize: '16px', fontWeight: result.IsRead ? 'normal' : 'bold' }}>
              {result.Patient.Fullname}
            </IonCardTitle>
            {/* labGate API v3 uses Laboratory?.Name */}
            <IonCardSubtitle>{result.Laboratory?.Name || 'Labor'}</IonCardSubtitle>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {result.IsFavorite && (
              <IonIcon icon={star} color="warning" style={{ fontSize: '18px' }} />
            )}
            {result.isPinned && (
              <IonIcon icon={pinOutline} color="primary" style={{ fontSize: '18px' }} />
            )}
            <IonBadge className={statusBadgeClass[statusKey]}>
              {t(`results.status.${statusKey}`)}
            </IonBadge>
          </div>
        </div>
      </IonCardHeader>

      <IonCardContent>
        {/* Date and Lab Number */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
          <IonText color="medium">
            <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {/* labGate API v3 uses ReportDate */}
            {format(new Date(result.ReportDate), 'dd.MM.yyyy', { locale: de })}
          </IonText>
          {/* labGate API v3 uses LabNo */}
          <IonText color="medium">#{result.LabNo}</IonText>
        </div>

        {/* Laboratory Section */}
        {result.LaboratorySection && (
          <div style={{ marginBottom: '8px' }}>
            <IonText color="medium" style={{ fontSize: '12px' }}>
              {result.LaboratorySection}
            </IonText>
          </div>
        )}

        {/* Test Summary - labGate API v3 uses ResultData */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tests.slice(0, 4).map((test) => (
            <div
              key={test.Id}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--ion-color-light)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {test.IsPathological && (
                <IonIcon
                  icon={isCritical(test) ? alertCircleOutline : checkmarkCircleOutline}
                  style={{ color: getPathologyColor(test), fontSize: '14px' }}
                />
              )}
              {/* labGate API v3 uses TestIdent or TestName */}
              <span style={{ fontWeight: 500 }}>{test.TestIdent || test.TestName?.substring(0, 6)}:</span>
              <span style={{ color: getPathologyColor(test) }}>{test.Value}</span>
              <span style={{ color: 'var(--ion-color-medium)' }}>{test.Unit}</span>
            </div>
          ))}
          {tests.length > 4 && (
            <div
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--ion-color-light)',
                fontSize: '12px',
              }}
            >
              +{tests.length - 4} weitere
            </div>
          )}
        </div>

        {/* Abnormal Values Indicator */}
        {hasCriticalValues && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IonIcon icon={alertCircleOutline} color="danger" />
            <IonText color="danger" style={{ fontSize: '13px' }}>
              Kritische Werte vorhanden
            </IonText>
          </div>
        )}

        {/* Confirmable indicator */}
        {result.IsConfirmable && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(var(--ion-color-primary-rgb), 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IonIcon icon={checkmarkCircleOutline} color="primary" />
            <IonText color="primary" style={{ fontSize: '13px' }}>
              Bestaetigung erforderlich
            </IonText>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
