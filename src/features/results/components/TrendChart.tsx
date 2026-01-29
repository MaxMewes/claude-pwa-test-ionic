import React, { useState, useRef, useEffect } from 'react';
import { IonSpinner, IonText, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { downloadOutline } from 'ionicons/icons';
import { usePatientLabTrends, TestInfo, TrendDataPoint } from '../hooks/usePatientLabTrends';

interface TrendChartProps {
  patientId: number;
  initialTestIdent?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ patientId, initialTestIdent }) => {
  const { data, isLoading, error, refetch } = usePatientLabTrends(patientId);
  const [selectedTest, setSelectedTest] = useState<string>(initialTestIdent || '');
  const chartRef = useRef<HTMLDivElement>(null);

  // Auto-select first test or initial test when data loads
  useEffect(() => {
    if (data && data.testsMap.size > 0 && !selectedTest) {
      if (initialTestIdent && data.testsMap.has(initialTestIdent)) {
        setSelectedTest(initialTestIdent);
      } else {
        const firstTest = Array.from(data.testsMap.keys())[0];
        setSelectedTest(firstTest);
      }
    }
  }, [data, initialTestIdent, selectedTest]);

  const availableTests = data ? Array.from(data.testsMap.values()) : [];
  const trendData = data && selectedTest ? data.trendData.get(selectedTest) || [] : [];
  const testInfo = data && selectedTest ? data.testsMap.get(selectedTest) : undefined;

  // Get reference range
  const referenceRange =
    testInfo && testInfo.normalLow !== null && testInfo.normalHigh !== null
      ? { min: testInfo.normalLow, max: testInfo.normalHigh }
      : null;

  // Calculate Y-axis domain
  const values = trendData.map((d) => d.value);
  const minValue = Math.min(...values, referenceRange?.min ?? Infinity);
  const maxValue = Math.max(...values, referenceRange?.max ?? -Infinity);
  const padding = (maxValue - minValue) * 0.1 || 1;
  const yDomain: [number, number] = [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];

  // Export chart as image
  const handleExport = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx!.fillStyle = 'white';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = `laborwert-${testInfo?.testName || selectedTest}-verlauf.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (isLoading) {
    return (
      <div style={{ padding: '16px' }}>
        <IonText color="dark">
          <h3 style={{ margin: '0 0 16px 0' }}>Laborwert-Verlauf</h3>
        </IonText>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <IonSpinner />
          <IonText color="medium" style={{ marginLeft: '12px' }}>
            Lade Verlaufsdaten...
          </IonText>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px' }}>
        <IonText color="dark">
          <h3 style={{ margin: '0 0 16px 0' }}>Laborwert-Verlauf</h3>
        </IonText>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <IonText color="danger">Fehler beim Laden der Daten</IonText>
          <div style={{ marginTop: '16px' }}>
            <IonButton size="small" fill="outline" onClick={() => refetch()}>
              Erneut versuchen
            </IonButton>
          </div>
        </div>
      </div>
    );
  }

  if (availableTests.length === 0) {
    return (
      <div style={{ padding: '16px' }}>
        <IonText color="dark">
          <h3 style={{ margin: '0 0 16px 0' }}>Laborwert-Verlauf</h3>
        </IonText>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <IonText color="medium">Keine Laborwerte mit numerischen Ergebnissen vorhanden</IonText>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <IonText color="dark">
          <h3 style={{ margin: 0 }}>Laborwert-Verlauf</h3>
        </IonText>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonSelect
            value={selectedTest}
            onIonChange={(e) => setSelectedTest(e.detail.value)}
            interface="popover"
            style={{ maxWidth: '200px' }}
          >
            {availableTests.map((test) => (
              <IonSelectOption key={test.testIdent} value={test.testIdent}>
                {test.testName}
              </IonSelectOption>
            ))}
          </IonSelect>
          {trendData.length > 0 && (
            <IonButton size="small" fill="clear" onClick={handleExport}>
              <IonIcon icon={downloadOutline} />
            </IonButton>
          )}
        </div>
      </div>

      {testInfo && (
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: 'var(--ion-color-medium)',
          }}
        >
          {testInfo.unit && (
            <span>
              <strong>Einheit:</strong> {testInfo.unit}
            </span>
          )}
          {testInfo.normalText && (
            <span>
              <strong>Referenz:</strong> {testInfo.normalText}
            </span>
          )}
          {referenceRange && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid var(--result-normal)',
                  borderRadius: '4px',
                }}
              ></span>
              Normalbereich
            </span>
          )}
        </div>
      )}

      {trendData.length > 0 ? (
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ion-border-color, #e5e7eb)" />
              <XAxis
                dataKey="date"
                stroke="var(--ion-color-medium)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fill: 'var(--ion-color-medium)' }}
              />
              <YAxis
                stroke="var(--ion-color-medium)"
                fontSize={12}
                domain={yDomain}
                tick={{ fill: 'var(--ion-color-medium)' }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pointData = payload[0].payload as TrendDataPoint;
                    const isOutOfRange =
                      referenceRange && (pointData.value < referenceRange.min || pointData.value > referenceRange.max);
                    return (
                      <div
                        style={{
                          backgroundColor: 'var(--ion-card-background, white)',
                          border: '1px solid var(--ion-border-color)',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: 500, color: 'var(--ion-text-color)' }}>{pointData.date}</p>
                        <p
                          style={{
                            margin: '4px 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: isOutOfRange ? 'var(--result-critical)' : 'var(--labgate-brand)',
                          }}
                        >
                          {pointData.value.toFixed(2)} {testInfo?.unit || ''}
                          {isOutOfRange && (
                            <span style={{ marginLeft: '4px', fontSize: '12px' }}>
                              {pointData.value < referenceRange!.min ? '(niedrig)' : '(hoch)'}
                            </span>
                          )}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                          Befund: {pointData.labNo}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {referenceRange && (
                <>
                  <ReferenceArea
                    y1={referenceRange.min}
                    y2={referenceRange.max}
                    fill="#22C55E"
                    fillOpacity={0.1}
                    stroke="none"
                  />
                  <ReferenceLine y={referenceRange.min} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.7} />
                  <ReferenceLine y={referenceRange.max} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.7} />
                </>
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#70CC60"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: TrendDataPoint };
                  if (cx === undefined || cy === undefined || !payload) return <></>;
                  const isOutOfRange =
                    referenceRange && (payload.value < referenceRange.min || payload.value > referenceRange.max);
                  return (
                    <circle
                      key={`${payload.resultId}-${payload.value}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={isOutOfRange ? '#EF4444' : '#70CC60'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: '#5cb84e', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IonText color="medium">Keine Verlaufsdaten für {testInfo?.testName || 'diesen Test'} vorhanden</IonText>
        </div>
      )}

      {trendData.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--ion-border-color)',
            fontSize: '13px',
            color: 'var(--ion-color-medium)',
          }}
        >
          <p style={{ margin: 0 }}>{trendData.length} Messwert(e) aus den letzten 20 Befunden</p>
        </div>
      )}
    </div>
  );
};
