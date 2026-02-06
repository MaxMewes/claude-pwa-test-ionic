import React, { useState, useCallback } from 'react';
import { IonIcon, IonAccordionGroup, IonAccordion, IonItem } from '@ionic/react';
import { arrowUp, arrowDown } from 'ionicons/icons';
import { TestResult } from '../../../api/types';
import { TrendChart } from './TrendChart';
import { usePatientLabTrends } from '../hooks/usePatientLabTrends';

interface TestResultListProps {
  tests: TestResult[];
  patientId?: number;
  onTestClick?: (test: TestResult) => void;
}

// Colors using CSS variables for dark mode support
const COLORS = {
  normal: 'var(--result-normal)',
  pathologicalLowHigh: 'var(--result-high)',
  pathologicalVeryLowHigh: 'var(--result-critical)',
  text: 'var(--labgate-text)',
  textLight: 'var(--labgate-text-light)',
  rowEven: 'var(--labgate-row-even)',
  rowOdd: 'var(--labgate-row-odd)',
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

export const TestResultList: React.FC<TestResultListProps> = ({ tests, patientId, onTestClick }) => {
  const [expandedTest, setExpandedTest] = useState<string | undefined>();
  const { data: trendData } = usePatientLabTrends(patientId);

  const handleAccordionChange = useCallback((e: CustomEvent) => {
    setExpandedTest(e.detail.value as string | undefined);
  }, []);

  // Check if a test has 2+ trend data points
  const hasTrend = useCallback((testIdent: string): boolean => {
    if (!trendData) return false;
    const points = trendData.trendData.get(testIdent);
    return !!points && points.length >= 2;
  }, [trendData]);

  // Group tests: pathological first, then normal
  const pathologicalTests = tests.filter((t) => t.IsPathological);
  const normalTests = tests.filter((t) => !t.IsPathological);

  const renderTestRowContent = (test: TestResult, index: number) => {
    const pathoInfo = getPathoInfo(test);
    const refRange = formatReferenceRange(test);
    const bgColor = index % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd;

    return { pathoInfo, refRange, bgColor };
  };

  const renderTestRow = (test: TestResult, index: number) => {
    const { pathoInfo, refRange, bgColor } = renderTestRowContent(test, index);
    const showAccordion = hasTrend(test.TestIdent);
    const accordionValue = test.TestIdent || test.Id.toString();

    const rowContent = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '4px 0',
        }}
      >
        {/* Left side: Test name + reference range */}
        <div style={{ flex: 1, minWidth: 0 }}>
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
        </div>
      </div>
    );

    if (showAccordion) {
      return (
        <IonAccordion key={test.Id} value={accordionValue}>
          <IonItem slot="header" lines="full" style={{ '--background': bgColor }}>
            {rowContent}
          </IonItem>
          <div slot="content" style={{ padding: '0 8px 8px' }}>
            {expandedTest === accordionValue && patientId && (
              <TrendChart patientId={patientId} initialTestIdent={test.TestIdent} />
            )}
          </div>
        </IonAccordion>
      );
    }

    // Plain row for tests without trend data
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
          borderBottom: '1px solid var(--labgate-border)',
        }}
      >
        {rowContent}
      </div>
    );
  };

  const renderSectionHeader = (title: string, count: number, color: string) => (
    <div
      style={{
        padding: '10px 16px',
        backgroundColor: 'var(--ion-background-color)',
        borderBottom: '1px solid var(--labgate-border)',
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
    <div style={{ backgroundColor: 'var(--labgate-surface)' }}>
      <IonAccordionGroup onIonChange={handleAccordionChange}>
        {/* Pathological values first */}
        {pathologicalTests.length > 0 && (
          <>
            {renderSectionHeader('Auffällige Werte', pathologicalTests.length, COLORS.pathologicalVeryLowHigh)}
            {pathologicalTests.map((test, index) => renderTestRow(test, index))}
          </>
        )}

        {/* Normal values */}
        {normalTests.length > 0 && (
          <>
            {renderSectionHeader('Normale Werte', normalTests.length, COLORS.normal)}
            {normalTests.map((test, index) => renderTestRow(test, index))}
          </>
        )}
      </IonAccordionGroup>

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
