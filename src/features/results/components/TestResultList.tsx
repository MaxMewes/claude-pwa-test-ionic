import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowUp, arrowDown, chevronForward } from 'ionicons/icons';
import { TestResult } from '../../../api/types';

interface TestResultListProps {
  tests: TestResult[];
  onTestClick?: (test: TestResult) => void;
}

// Colors matching the old Xamarin app
const COLORS = {
  normal: '#70CC60',           // Green
  pathologicalLowHigh: '#F7CD45',    // Yellow/Orange
  pathologicalVeryLowHigh: '#FF6B6B', // Red
  text: '#3C3C3B',
  textLight: '#646363',
  rowEven: '#F4F4F4',
  rowOdd: '#FFFFFF',
};

// Get pathology info based on indicator
const getPathoInfo = (test: TestResult): {
  color: string;
  icon: typeof arrowUp | null;
  isVery: boolean;
} => {
  if (!test.IsPathological) {
    return { color: COLORS.normal, icon: null, isVery: false };
  }

  switch (test.PathologyIndicator) {
    case 'LL':
      return { color: COLORS.pathologicalVeryLowHigh, icon: arrowDown, isVery: true };
    case 'L':
      return { color: COLORS.pathologicalLowHigh, icon: arrowDown, isVery: false };
    case 'HH':
      return { color: COLORS.pathologicalVeryLowHigh, icon: arrowUp, isVery: true };
    case 'H':
      return { color: COLORS.pathologicalLowHigh, icon: arrowUp, isVery: false };
    default:
      return { color: COLORS.pathologicalLowHigh, icon: null, isVery: false };
  }
};

// Format reference range with unit
const formatReferenceRange = (test: TestResult): string => {
  if (!test.ReferenceRange && test.ReferenceMin == null && test.ReferenceMax == null) {
    return '';
  }

  if (test.ReferenceRange) {
    return test.Unit ? `${test.ReferenceRange} ${test.Unit}` : test.ReferenceRange;
  }

  if (test.ReferenceMin != null && test.ReferenceMax != null) {
    const range = `${test.ReferenceMin} - ${test.ReferenceMax}`;
    return test.Unit ? `${range} ${test.Unit}` : range;
  }

  return '';
};

export const TestResultList: React.FC<TestResultListProps> = ({ tests, onTestClick }) => {
  // Group tests: pathological first, then normal
  const pathologicalTests = tests.filter((t) => t.IsPathological);
  const normalTests = tests.filter((t) => !t.IsPathological);

  const renderTestRow = (test: TestResult, index: number, isPathoSection: boolean) => {
    const pathoInfo = getPathoInfo(test);
    const refRange = formatReferenceRange(test);
    const bgColor = index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd;

    return (
      <div
        key={test.Id}
        onClick={() => onTestClick?.(test)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: bgColor,
          cursor: onTestClick ? 'pointer' : 'default',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        {/* Left side: Test name + reference range */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Test name with patho icon inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: test.IsPathological ? 600 : 400,
                color: COLORS.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {test.TestName}
            </span>
            {/* Pathological indicator icon */}
            {pathoInfo.icon && (
              <IonIcon
                icon={pathoInfo.icon}
                style={{
                  color: pathoInfo.color,
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              />
            )}
          </div>

          {/* Reference range */}
          {refRange && (
            <div
              style={{
                fontSize: '12px',
                color: COLORS.textLight,
                marginTop: '2px',
              }}
            >
              Ref: {refRange}
            </div>
          )}
        </div>

        {/* Right side: Value + unit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '12px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: test.IsPathological ? pathoInfo.color : COLORS.text,
            }}
          >
            {test.Value}
            {test.Unit && (
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  marginLeft: '4px',
                  color: COLORS.textLight,
                }}
              >
                {test.Unit}
              </span>
            )}
          </span>

          {/* Forward chevron */}
          {onTestClick && (
            <IonIcon
              icon={chevronForward}
              style={{
                color: COLORS.textLight,
                fontSize: '16px',
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderSectionHeader = (title: string, count: number, color: string) => (
    <div
      style={{
        padding: '10px 16px',
        backgroundColor: '#FAFAFA',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: '12px',
          color: COLORS.textLight,
        }}
      >
        ({count})
      </span>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      {/* Pathological values first */}
      {pathologicalTests.length > 0 && (
        <>
          {renderSectionHeader('Auffällige Werte', pathologicalTests.length, COLORS.pathologicalVeryLowHigh)}
          {pathologicalTests.map((test, index) => renderTestRow(test, index, true))}
        </>
      )}

      {/* Normal values */}
      {normalTests.length > 0 && (
        <>
          {renderSectionHeader('Normale Werte', normalTests.length, COLORS.normal)}
          {normalTests.map((test, index) => renderTestRow(test, index, false))}
        </>
      )}

      {/* Empty state */}
      {tests.length === 0 && (
        <div
          style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: COLORS.textLight,
          }}
        >
          Keine Laborwerte vorhanden
        </div>
      )}
    </div>
  );
};
