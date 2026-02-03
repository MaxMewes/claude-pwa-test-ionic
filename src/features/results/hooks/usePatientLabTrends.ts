import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { LabResult } from '../../../api/types';

export interface TrendDataPoint {
  date: string;
  dateRaw: string;
  value: number;
  resultId: number;
  labNo: string;
}

export interface TestInfo {
  testIdent: string;
  testName: string;
  unit: string | null;
  normalLow: number | null;
  normalHigh: number | null;
  normalText: string | null;
}

interface ResultDataItemV3 {
  Id: number;
  TestIdent: string;
  TestName: string;
  Value: number | null;
  ValueText: string | null;
  Unit: string | null;
  NormalLow: number | null;
  NormalHigh: number | null;
  NormalText: string | null;
  PathoFlag: 'VeryLow' | 'Low' | 'Unknown' | 'High' | 'VeryHigh' | null;
}

interface ResultDetailV3 {
  Id: number;
  LabNo: string;
  ReportDate: string;
  ResultData?: Record<string, ResultDataItemV3[]>;
}

interface ResultDetailResponse {
  Result: ResultDetailV3;
}

interface PatientResultsResponse {
  Results: LabResult[];
}

interface PatientLabTrendsData {
  testsMap: Map<string, TestInfo>;
  trendData: Map<string, TrendDataPoint[]>;
}

export function usePatientLabTrends(patientId: number | undefined) {
  return useQuery({
    queryKey: ['patient-lab-trends', patientId],
    queryFn: async (): Promise<PatientLabTrendsData> => {
      // labGate API v3 endpoint
      const listResponse = await axiosInstance.get<PatientResultsResponse>(
        `/api/v3/patients/${patientId}/results`
      );

      const resultIds = (listResponse.data.Results || []).map((r) => r.Id);

      // Fetch details for each result (limit to last 20 for performance)
      const recentIds = resultIds.slice(0, 20);
      const testsMap = new Map<string, TestInfo>();
      const trendData = new Map<string, TrendDataPoint[]>();

      // Request batching: Process in batches of 5 to avoid overwhelming the server
      const BATCH_SIZE = 5;
      const BATCH_DELAY = 100; // 100ms delay between batches to rate limit

      for (let i = 0; i < recentIds.length; i += BATCH_SIZE) {
        const batch = recentIds.slice(i, i + BATCH_SIZE);
        
        // Add delay between batches for rate limiting (except first batch)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }

        // Process batch in parallel
        await Promise.all(
          batch.map(async (resultId) => {
            try {
              const detailResponse = await axiosInstance.get<ResultDetailResponse>(`/api/v3/results/${resultId}`);
              const result = detailResponse.data.Result;

              // Process all tests from ResultData
              if (result.ResultData) {
                for (const sectionTests of Object.values(result.ResultData)) {
                  for (const test of sectionTests) {
                    if (!test.ValueText) continue;

                    // Try to parse numeric value
                    const numericMatch = test.ValueText.match(/^[\d.,]+/);
                    if (!numericMatch) continue;

                    const value = parseFloat(numericMatch[0].replace(',', '.'));
                    if (isNaN(value)) continue;

                    // Store test info
                    if (!testsMap.has(test.TestIdent)) {
                      testsMap.set(test.TestIdent, {
                        testIdent: test.TestIdent,
                        testName: test.TestName,
                        unit: test.Unit,
                        normalLow: test.NormalLow,
                        normalHigh: test.NormalHigh,
                        normalText: test.NormalText,
                      });
                    }

                    // Add to trend data
                    const existing = trendData.get(test.TestIdent) || [];
                    existing.push({
                      date: new Date(result.ReportDate).toLocaleDateString('de-DE'),
                      dateRaw: result.ReportDate,
                      value,
                      resultId: result.Id,
                      labNo: result.LabNo,
                    });
                    trendData.set(test.TestIdent, existing);
                  }
                }
              }
            } catch (err) {
              console.error('Error fetching result details:', err);
            }
          })
        );
      }

      // Sort trend data by date
      trendData.forEach((data, key) => {
        data.sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime());
        trendData.set(key, data);
      });

      return { testsMap, trendData };
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
