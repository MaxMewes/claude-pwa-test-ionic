import React, { useRef, useCallback } from 'react';
import { IonText, IonIcon, IonSpinner } from '@ionic/react';
import { alertCircleOutline, arrowUp, arrowDown } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { usePatientLabTrends, TrendDataPoint, TestInfo } from '../hooks/usePatientLabTrends';

interface CumulativeResultsViewProps {
  patientId: number;
  onTestClick?: (testIdent: string) => void;
}

interface ResultColumn {
  date: string;
  labNo: string;
  resultId: number;
}

/**
 * CumulativeResultsView displays lab test results across multiple reports in a table format.
 * Shows test names on the left, with values from multiple results horizontally scrollable.
 */
export const CumulativeResultsView: React.FC<CumulativeResultsViewProps> = ({
  patientId,
  onTestClick,
}) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = usePatientLabTrends(patientId);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  // Synchronized horizontal scrolling
  const handleHeaderScroll = useCallback(() => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      bodyScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
    }
  }, []);

  const handleBodyScroll = useCallback(() => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <IonSpinner name="crescent" />
        <IonText color="medium" style={{ marginTop: '16px' }}>
          {t('cumulativeResults.loading')}
        </IonText>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <IonText color="danger">{t('cumulativeResults.errorLoading')}</IonText>
      </div>
    );
  }

  if (!data || data.testsMap.size === 0) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <IonText color="medium">{t('cumulativeResults.noData')}</IonText>
      </div>
    );
  }

  // Build result columns (unique dates/results)
  const resultColumnsMap = new Map<number, ResultColumn>();
  data.trendData.forEach((points) => {
    points.forEach((point) => {
      if (!resultColumnsMap.has(point.resultId)) {
        resultColumnsMap.set(point.resultId, {
          date: point.date,
          labNo: point.labNo,
          resultId: point.resultId,
        });
      }
    });
  });

  // Sort by date (newest first for cumulative view)
  const resultColumns = Array.from(resultColumnsMap.values()).sort((a, b) => {
    const dateA = data.trendData.values().next().value?.find((p: TrendDataPoint) => p.resultId === a.resultId)?.dateRaw;
    const dateB = data.trendData.values().next().value?.find((p: TrendDataPoint) => p.resultId === b.resultId)?.dateRaw;
    return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
  });

  // Get all tests sorted alphabetically
  const tests = Array.from(data.testsMap.values()).sort((a, b) =>
    a.testName.localeCompare(b.testName, 'de')
  );

  // Get pathology info for a value
  const getPathologyInfo = (value: number, testInfo: TestInfo) => {
    if (testInfo.normalLow === null || testInfo.normalHigh === null) {
      return { isPathological: false, indicator: null };
    }

    if (value < testInfo.normalLow) {
      const isCritical = value < testInfo.normalLow * 0.8;
      return {
        isPathological: true,
        indicator: isCritical ? 'LL' : 'L',
        icon: arrowDown,
        color: isCritical ? 'var(--result-critical)' : 'var(--result-low)'
      };
    }

    if (value > testInfo.normalHigh) {
      const isCritical = value > testInfo.normalHigh * 1.2;
      return {
        isPathological: true,
        indicator: isCritical ? 'HH' : 'H',
        icon: arrowUp,
        color: isCritical ? 'var(--result-critical)' : 'var(--result-high)'
      };
    }

    return { isPathological: false, indicator: null, color: 'var(--labgate-text)' };
  };

  const COLUMN_WIDTH = 90;
  const LABEL_WIDTH = 140;
  const UNIT_WIDTH = 50;

  return (
    <div className="cumulative-results-view">
      {/* Sticky Header */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--ion-background-color, #f4f5f8)',
          borderBottom: '1px solid var(--labgate-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Fixed header labels */}
        <div
          style={{
            minWidth: LABEL_WIDTH,
            padding: '12px 8px',
            borderRight: '1px solid var(--labgate-border)',
            backgroundColor: 'var(--ion-background-color, #f4f5f8)',
          }}
        >
          <IonText style={{ fontSize: '12px', fontWeight: 600, color: 'var(--labgate-text)' }}>
            {t('cumulativeResults.investigation')}
          </IonText>
          <br />
          <IonText style={{ fontSize: '11px', color: 'var(--labgate-text-muted)' }}>
            {t('cumulativeResults.referenceRange')}
          </IonText>
        </div>
        <div
          style={{
            minWidth: UNIT_WIDTH,
            padding: '12px 4px',
            borderRight: '1px solid var(--labgate-border)',
            backgroundColor: 'var(--ion-background-color, #f4f5f8)',
            textAlign: 'center',
          }}
        >
          <IonText style={{ fontSize: '11px', color: 'var(--labgate-text-muted)' }}>
            {t('cumulativeResults.unit')}
          </IonText>
        </div>

        {/* Scrollable header with dates */}
        <div
          ref={headerScrollRef}
          onScroll={handleHeaderScroll}
          style={{
            flex: 1,
            overflowX: 'auto',
            display: 'flex',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {resultColumns.map((col) => (
            <div
              key={col.resultId}
              style={{
                minWidth: COLUMN_WIDTH,
                maxWidth: COLUMN_WIDTH,
                padding: '8px 4px',
                textAlign: 'center',
                borderRight: '1px solid var(--labgate-border)',
              }}
            >
              <IonText style={{ fontSize: '12px', fontWeight: 600, display: 'block', color: 'var(--labgate-text)' }}>
                {col.date}
              </IonText>
              <IonText style={{ fontSize: '10px', color: 'var(--labgate-text-muted)', display: 'block', marginTop: '2px' }}>
                {col.labNo}
              </IonText>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <div style={{ overflowY: 'auto' }}>
        {tests.map((testInfo, index) => {
          const trendPoints = data.trendData.get(testInfo.testIdent) || [];
          const hasPathological = trendPoints.some((p) => {
            const info = getPathologyInfo(p.value, testInfo);
            return info.isPathological;
          });

          return (
            <div
              key={testInfo.testIdent}
              onClick={() => onTestClick?.(testInfo.testIdent)}
              style={{
                display: 'flex',
                backgroundColor: index % 2 === 0 ? 'var(--ion-card-background, white)' : 'var(--ion-background-color, #f9f9f9)',
                borderBottom: '1px solid var(--labgate-border)',
                cursor: onTestClick ? 'pointer' : 'default',
              }}
            >
              {/* Test name and reference */}
              <div
                style={{
                  minWidth: LABEL_WIDTH,
                  maxWidth: LABEL_WIDTH,
                  padding: '10px 8px',
                  borderRight: '1px solid var(--labgate-border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '4px',
                }}
              >
                {hasPathological && (
                  <IonIcon
                    icon={alertCircleOutline}
                    style={{
                      color: 'var(--result-indicator-patho)',
                      fontSize: '14px',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <IonText
                    style={{
                      fontSize: '13px',
                      fontWeight: hasPathological ? 600 : 400,
                      color: 'var(--labgate-text)',
                      display: 'block',
                      wordBreak: 'break-word',
                    }}
                  >
                    {testInfo.testName}
                  </IonText>
                  {testInfo.normalText && (
                    <IonText style={{ fontSize: '11px', color: 'var(--labgate-text-muted)', display: 'block', marginTop: '2px' }}>
                      {testInfo.normalText}
                    </IonText>
                  )}
                </div>
              </div>

              {/* Unit */}
              <div
                style={{
                  minWidth: UNIT_WIDTH,
                  maxWidth: UNIT_WIDTH,
                  padding: '10px 4px',
                  borderRight: '1px solid var(--labgate-border)',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IonText style={{ fontSize: '11px', color: 'var(--labgate-text-muted)' }}>
                  {testInfo.unit || '-'}
                </IonText>
              </div>

              {/* Values - synchronized scroll */}
              <div
                ref={index === 0 ? bodyScrollRef : undefined}
                onScroll={index === 0 ? handleBodyScroll : undefined}
                style={{
                  flex: 1,
                  overflowX: index === 0 ? 'auto' : 'hidden',
                  display: 'flex',
                  scrollbarWidth: 'thin',
                }}
              >
                {resultColumns.map((col) => {
                  const point = trendPoints.find((p) => p.resultId === col.resultId);
                  const pathInfo = point ? getPathologyInfo(point.value, testInfo) : null;

                  return (
                    <div
                      key={col.resultId}
                      style={{
                        minWidth: COLUMN_WIDTH,
                        maxWidth: COLUMN_WIDTH,
                        padding: '10px 4px',
                        textAlign: 'center',
                        borderRight: '1px solid var(--labgate-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                      }}
                    >
                      {point ? (
                        <>
                          {pathInfo?.icon && (
                            <IonIcon
                              icon={pathInfo.icon}
                              style={{
                                color: pathInfo.color,
                                fontSize: '12px',
                              }}
                            />
                          )}
                          <IonText
                            style={{
                              fontSize: '13px',
                              fontWeight: pathInfo?.isPathological ? 600 : 400,
                              color: pathInfo?.color || 'var(--labgate-text)',
                            }}
                          >
                            {point.value.toFixed(point.value % 1 === 0 ? 0 : 1)}
                          </IonText>
                        </>
                      ) : (
                        <IonText style={{ fontSize: '13px', color: 'var(--labgate-text-muted)' }}>
                          -
                        </IonText>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--labgate-border)', backgroundColor: 'var(--ion-background-color)' }}>
        <IonText style={{ fontSize: '12px', color: 'var(--labgate-text-muted)' }}>
          {t('cumulativeResults.resultsCount', { count: resultColumns.length })} · {t('cumulativeResults.testsCount', { count: tests.length })}
        </IonText>
      </div>
    </div>
  );
};
