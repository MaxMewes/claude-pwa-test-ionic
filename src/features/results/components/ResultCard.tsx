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
import { pinOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { LabResult, ResultFlag } from '../../../api/types';

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

export const ResultCard: React.FC<ResultCardProps> = ({ result, onClick }) => {
  const { t } = useTranslation();

  const hasAbnormalValues = result.tests.some(
    (test) => test.flag !== 'normal'
  );

  const hasCriticalValues = result.tests.some(
    (test) => test.flag === 'critical_low' || test.flag === 'critical_high'
  );

  const getFlagColor = (flag: ResultFlag): string => {
    switch (flag) {
      case 'low':
        return 'var(--result-low)';
      case 'high':
        return 'var(--result-high)';
      case 'critical_low':
      case 'critical_high':
        return 'var(--result-critical)';
      case 'abnormal':
        return 'var(--result-abnormal)';
      default:
        return 'var(--result-normal)';
    }
  };

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
        opacity: result.isRead ? 0.85 : 1,
      }}
    >
      <IonCardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <IonCardTitle style={{ fontSize: '16px', fontWeight: result.isRead ? 'normal' : 'bold' }}>
              {result.patientName}
            </IonCardTitle>
            <IonCardSubtitle>{result.laboratoryName}</IonCardSubtitle>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {result.isPinned && (
              <IonIcon icon={pinOutline} color="primary" style={{ fontSize: '18px' }} />
            )}
            <IonBadge className={statusBadgeClass[result.status]}>
              {t(`results.status.${result.status}`)}
            </IonBadge>
          </div>
        </div>
      </IonCardHeader>

      <IonCardContent>
        {/* Date and Order Number */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
          <IonText color="medium">
            <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {format(new Date(result.reportDate), 'dd.MM.yyyy', { locale: de })}
          </IonText>
          <IonText color="medium">#{result.orderNumber}</IonText>
        </div>

        {/* Test Summary */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {result.tests.slice(0, 4).map((test) => (
            <div
              key={test.id}
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
              {test.flag !== 'normal' && (
                <IonIcon
                  icon={test.flag === 'critical_low' || test.flag === 'critical_high' ? alertCircleOutline : checkmarkCircleOutline}
                  style={{ color: getFlagColor(test.flag), fontSize: '14px' }}
                />
              )}
              <span style={{ fontWeight: 500 }}>{test.shortName}:</span>
              <span style={{ color: getFlagColor(test.flag) }}>{test.value}</span>
              <span style={{ color: 'var(--ion-color-medium)' }}>{test.unit}</span>
            </div>
          ))}
          {result.tests.length > 4 && (
            <div
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--ion-color-light)',
                fontSize: '12px',
              }}
            >
              +{result.tests.length - 4} weitere
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
      </IonCardContent>
    </IonCard>
  );
};
