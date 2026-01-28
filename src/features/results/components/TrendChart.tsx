import React from 'react';
import { IonSpinner, IonText } from '@ionic/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useResultTrend } from '../hooks/useResults';
import { TestResult } from '../../../api/types';

interface TrendChartProps {
  resultId: string;
  test: TestResult;
}

export const TrendChart: React.FC<TrendChartProps> = ({ resultId, test }) => {
  const { data: trendData, isLoading, error } = useResultTrend(resultId, test.id);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
        <IonSpinner />
      </div>
    );
  }

  if (error || !trendData || trendData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <IonText color="medium">Keine Verlaufsdaten verfuegbar</IonText>
      </div>
    );
  }

  const formattedData = trendData.map((point) => ({
    ...point,
    dateFormatted: format(new Date(point.date), 'dd.MM.yy', { locale: de }),
  }));

  const minValue = Math.min(...trendData.map((d) => d.value));
  const maxValue = Math.max(...trendData.map((d) => d.value));
  const padding = (maxValue - minValue) * 0.2 || 1;

  return (
    <div style={{ padding: '16px' }}>
      <IonText color="dark">
        <h3 style={{ margin: '0 0 16px 0' }}>{test.name} - Verlauf</h3>
      </IonText>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ion-border-color)" />
          <XAxis
            dataKey="dateFormatted"
            tick={{ fontSize: 12, fill: 'var(--ion-color-medium)' }}
            tickLine={false}
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            tick={{ fontSize: 12, fill: 'var(--ion-color-medium)' }}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--ion-card-background, #fff)',
              border: '1px solid var(--ion-border-color)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'var(--ion-text-color)' }}
            formatter={(value) => [`${value} ${test.unit}`, test.name]}
          />

          {/* Reference lines for normal range */}
          {test.referenceMin !== undefined && (
            <ReferenceLine
              y={test.referenceMin}
              stroke="var(--result-low)"
              strokeDasharray="5 5"
              label={{
                value: `Min: ${test.referenceMin}`,
                position: 'left',
                fontSize: 10,
                fill: 'var(--result-low)',
              }}
            />
          )}
          {test.referenceMax !== undefined && (
            <ReferenceLine
              y={test.referenceMax}
              stroke="var(--result-high)"
              strokeDasharray="5 5"
              label={{
                value: `Max: ${test.referenceMax}`,
                position: 'left',
                fontSize: 10,
                fill: 'var(--result-high)',
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--ion-color-primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--ion-color-primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: 'var(--ion-color-primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Reference Range Info */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--ion-color-light)',
          borderRadius: '8px',
        }}
      >
        <IonText color="medium" style={{ fontSize: '13px' }}>
          Referenzbereich: {test.referenceRange} {test.unit}
        </IonText>
      </div>
    </div>
  );
};
