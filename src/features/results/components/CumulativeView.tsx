import React from 'react';
import { IonList, IonItem, IonLabel, IonText, IonIcon, IonBadge } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import { TestResult } from '../../../api/types';

interface CumulativeViewProps {
  tests: TestResult[];
  onTestClick?: (test: TestResult) => void;
}

// labGate API v3 uses IsPathological and PathologyIndicator
const getPathologyInfo = (test: TestResult): { color: string; label: string } => {
  if (!test.IsPathological) {
    return { color: 'success', label: 'Normal' };
  }

  switch (test.PathologyIndicator) {
    case 'L':
      return { color: 'primary', label: 'Niedrig' };
    case 'LL':
      return { color: 'danger', label: 'Kritisch niedrig' };
    case 'H':
      return { color: 'warning', label: 'Hoch' };
    case 'HH':
      return { color: 'danger', label: 'Kritisch hoch' };
    case 'A':
      return { color: 'warning', label: 'Auffaellig' };
    default:
      return { color: 'warning', label: 'Auffaellig' };
  }
};

export const CumulativeView: React.FC<CumulativeViewProps> = ({ tests, onTestClick }) => {
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
      >
        <IonLabel>
          {/* labGate API v3 uses TestName */}
          <h2 style={{ fontWeight: test.IsPathological ? 600 : 400 }}>{test.TestName}</h2>
          {/* labGate API v3 uses ReferenceRange and Unit */}
          <p>{test.ReferenceRange} {test.Unit || ''}</p>
        </IonLabel>

        <div slot="end" style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {test.IsPathological && (
              <IonIcon
                icon={alertCircleOutline}
                color={pathologyInfo.color}
              />
            )}
            <IonText
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color:
                  test.IsPathological
                    ? `var(--ion-color-${pathologyInfo.color})`
                    : 'var(--ion-text-color)',
              }}
            >
              {/* labGate API v3 uses Value and Unit */}
              {test.Value} {test.Unit || ''}
            </IonText>
          </div>
          {test.IsPathological && (
            <IonBadge color={pathologyInfo.color} style={{ marginTop: '4px' }}>
              {pathologyInfo.label}
            </IonBadge>
          )}
          {test.Comment && (
            <IonText color="medium" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
              {test.Comment}
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
