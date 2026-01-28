import React from 'react';
import { IonList, IonItem, IonLabel, IonText, IonIcon, IonBadge } from '@ionic/react';
import { arrowUpOutline, arrowDownOutline, removeOutline } from 'ionicons/icons';
import { TestResult, ResultFlag } from '../../../api/types';

interface CumulativeViewProps {
  tests: TestResult[];
  onTestClick?: (test: TestResult) => void;
}

const getFlagInfo = (flag: ResultFlag): { color: string; label: string } => {
  switch (flag) {
    case 'low':
      return { color: 'primary', label: 'Niedrig' };
    case 'high':
      return { color: 'warning', label: 'Hoch' };
    case 'critical_low':
      return { color: 'danger', label: 'Kritisch niedrig' };
    case 'critical_high':
      return { color: 'danger', label: 'Kritisch hoch' };
    case 'abnormal':
      return { color: 'warning', label: 'Auffaellig' };
    default:
      return { color: 'success', label: 'Normal' };
  }
};

const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <IonIcon icon={arrowUpOutline} color="warning" />;
    case 'down':
      return <IonIcon icon={arrowDownOutline} color="primary" />;
    default:
      return <IonIcon icon={removeOutline} color="medium" />;
  }
};

export const CumulativeView: React.FC<CumulativeViewProps> = ({ tests, onTestClick }) => {
  // Group tests by category (for now, just show all)
  const normalTests = tests.filter((t) => t.flag === 'normal');
  const abnormalTests = tests.filter((t) => t.flag !== 'normal');

  const renderTest = (test: TestResult) => {
    const flagInfo = getFlagInfo(test.flag);

    return (
      <IonItem
        key={test.id}
        button
        onClick={() => onTestClick?.(test)}
        detail={!!test.previousValue}
      >
        <IonLabel>
          <h2 style={{ fontWeight: test.flag !== 'normal' ? 600 : 400 }}>{test.name}</h2>
          <p>{test.referenceRange} {test.unit}</p>
        </IonLabel>

        <div slot="end" style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {test.trend && getTrendIcon(test.trend)}
            <IonText
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color:
                  test.flag !== 'normal'
                    ? `var(--ion-color-${flagInfo.color})`
                    : 'var(--ion-text-color)',
              }}
            >
              {test.value} {test.unit}
            </IonText>
          </div>
          {test.flag !== 'normal' && (
            <IonBadge color={flagInfo.color} style={{ marginTop: '4px' }}>
              {flagInfo.label}
            </IonBadge>
          )}
          {test.previousValue && (
            <IonText color="medium" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Vorher: {test.previousValue}
            </IonText>
          )}
        </div>
      </IonItem>
    );
  };

  return (
    <div>
      {/* Abnormal Values First */}
      {abnormalTests.length > 0 && (
        <>
          <IonItem lines="none" color="light">
            <IonLabel>
              <h2 style={{ fontWeight: 600, color: 'var(--ion-color-danger)' }}>
                Auffaellige Werte ({abnormalTests.length})
              </h2>
            </IonLabel>
          </IonItem>
          <IonList>{abnormalTests.map(renderTest)}</IonList>
        </>
      )}

      {/* Normal Values */}
      {normalTests.length > 0 && (
        <>
          <IonItem lines="none" color="light">
            <IonLabel>
              <h2 style={{ fontWeight: 600, color: 'var(--ion-color-success)' }}>
                Normale Werte ({normalTests.length})
              </h2>
            </IonLabel>
          </IonItem>
          <IonList>{normalTests.map(renderTest)}</IonList>
        </>
      )}
    </div>
  );
};
