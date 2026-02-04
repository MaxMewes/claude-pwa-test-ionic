import React from 'react';
import { IonList, IonItem, IonLabel, IonText, IonIcon, IonBadge } from '@ionic/react';
import { alertCircleOutline, arrowUp, arrowDown } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { TestResult } from '../../../api/types';

interface CumulativeViewProps {
  tests: TestResult[];
  onTestClick?: (test: TestResult) => void;
}

/**
 * CumulativeView component displays lab test results grouped by pathology status.
 * 
 * @component
 * @example
 * ```tsx
 * <CumulativeView
 *   tests={testResults}
 *   onTestClick={(test) => viewTestDetails(test)}
 * />
 * ```
 */
export const CumulativeView: React.FC<CumulativeViewProps> = ({ tests, onTestClick }) => {
  const { t } = useTranslation();
  
  // labGate API v3 uses IsPathological and PathologyIndicator
  // Colors use CSS variables for dark mode support
  const getPathologyInfo = (test: TestResult): {
    color: string;
    cssColor: string;
    bgColor: string;
    label: string;
    icon?: typeof arrowUp;
  } => {
    if (!test.IsPathological) {
      return { 
        color: 'success', 
        cssColor: 'var(--result-normal)', 
        bgColor: 'var(--ion-color-success-tint)', 
        label: t('cumulativeView.normal') 
      };
    }

    switch (test.PathologyIndicator) {
      case 'L':
        return { 
          color: 'warning', 
          cssColor: 'var(--result-low)', 
          bgColor: 'var(--ion-color-warning-tint)', 
          label: t('cumulativeView.low'), 
          icon: arrowDown 
        };
      case 'LL':
        return { 
          color: 'danger', 
          cssColor: 'var(--result-critical)', 
          bgColor: 'var(--ion-color-danger-tint)', 
          label: t('cumulativeView.criticalLow'), 
          icon: arrowDown 
        };
      case 'H':
        return { 
          color: 'warning', 
          cssColor: 'var(--result-high)', 
          bgColor: 'var(--ion-color-warning-tint)', 
          label: t('cumulativeView.high'), 
          icon: arrowUp 
        };
      case 'HH':
        return { 
          color: 'danger', 
          cssColor: 'var(--result-critical)', 
          bgColor: 'var(--ion-color-danger-tint)', 
          label: t('cumulativeView.criticalHigh'), 
          icon: arrowUp 
        };
      case 'A':
        return { 
          color: 'warning', 
          cssColor: 'var(--result-abnormal)', 
          bgColor: 'var(--ion-color-warning-tint)', 
          label: t('cumulativeView.abnormal') 
        };
      default:
        return { 
          color: 'warning', 
          cssColor: 'var(--result-abnormal)', 
          bgColor: 'var(--ion-color-warning-tint)', 
          label: t('cumulativeView.abnormal') 
        };
    }
  };

  // labGate API v3 uses IsPathological
  const normalTests = tests.filter((t) => !t.IsPathological);
  const abnormalTests = tests.filter((t) => t.IsPathological);

  const renderTest = (test: TestResult) => {
    const pathologyInfo = getPathologyInfo(test);

    return (
      <IonItem
        key={test.Id}
        button
        onClick={() => onTestClick?.(test)}
        detail
        style={{
          '--border-color': test.IsPathological ? 'var(--result-indicator-patho)' : 'var(--labgate-border)',
        }}
      >
        {/* Pathology indicator bar on the left */}
        {test.IsPathological && (
          <div
            slot="start"
            aria-hidden="true"
            style={{
              width: '4px',
              alignSelf: 'stretch',
              backgroundColor: pathologyInfo.cssColor,
              marginRight: '8px',
              borderRadius: '2px',
            }}
          />
        )}

        <IonLabel>
          {/* labGate API v3 uses TestName */}
          <h2 style={{
            fontWeight: test.IsPathological ? 600 : 400,
            color: 'var(--labgate-text)',
            fontSize: '15px'
          }}>
            {test.TestName}
          </h2>
          {/* labGate API v3 uses ReferenceRange and Unit */}
          <p style={{ color: 'var(--labgate-text-light)', fontSize: '12px' }}>
            {t('cumulativeView.reference')}: {test.ReferenceRange} {test.Unit || ''}
          </p>
        </IonLabel>

        <div slot="end" style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {pathologyInfo.icon && (
              <IonIcon
                icon={pathologyInfo.icon}
                aria-hidden="true"
                style={{ color: pathologyInfo.cssColor, fontSize: '16px' }}
              />
            )}
            {test.IsPathological && !pathologyInfo.icon && (
              <IonIcon
                icon={alertCircleOutline}
                aria-hidden="true"
                style={{ color: pathologyInfo.cssColor, fontSize: '16px' }}
              />
            )}
            <IonText
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: test.IsPathological ? pathologyInfo.cssColor : 'var(--labgate-text)',
              }}
            >
              {/* labGate API v3 uses Value and Unit */}
              {test.Value} {test.Unit || ''}
            </IonText>
          </div>
          {test.IsPathological && (
            <IonBadge
              style={{
                marginTop: '4px',
                '--background': pathologyInfo.bgColor,
                '--color': pathologyInfo.cssColor,
                fontWeight: 600,
              }}
            >
              {pathologyInfo.label}
            </IonBadge>
          )}
          {test.Comment && (
            <IonText
              style={{
                fontSize: '12px',
                display: 'block',
                marginTop: '4px',
                color: 'var(--labgate-text-light)'
              }}
            >
              {test.Comment}
            </IonText>
          )}
        </div>
      </IonItem>
    );
  };

  return (
    <div>
      {/* Abnormal Values First - with red header */}
      {abnormalTests.length > 0 && (
        <>
          <div
            className="list-group-header"
            style={{
              color: 'var(--result-indicator-patho)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IonIcon icon={alertCircleOutline} aria-hidden="true" />
            {t('cumulativeView.abnormalValues')} ({abnormalTests.length})
          </div>
          <IonList lines="full">{abnormalTests.map(renderTest)}</IonList>
        </>
      )}

      {/* Normal Values - with green header */}
      {normalTests.length > 0 && (
        <>
          <div
            className="list-group-header"
            style={{
              color: 'var(--result-normal)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {t('cumulativeView.normalValues')} ({normalTests.length})
          </div>
          <IonList lines="full">{normalTests.map(renderTest)}</IonList>
        </>
      )}
    </div>
  );
};
