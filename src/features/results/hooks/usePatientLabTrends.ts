import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { RESULTS_ENDPOINTS } from '../../../api/endpoints';
import { patientsKeys } from '../../../api/queryKeys';

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

// Response types matching the v3 API spec

interface GetResultsResultInfo {
  Id: number;
  LabNo: string | null;
  ReportDate: string | null;
}

interface GetResultsResponse {
  Results: GetResultsResultInfo[];
}

interface CumulativeResultData {
  Value: number | null;
  ValueText: string | null;
  NormalText: string | null;
  NormalHigh: number | null;
  NormalLow: number | null;
  Unit: string | null;
  PathoFlag: 'VeryLow' | 'Low' | 'Unknown' | 'High' | 'VeryHigh' | null;
  PathoFlagText: string | null;
  LaboratorySection: string | null;
}

interface CumulativeResult {
  Id: number;
  ReportDate: string | null;
  LaboratoryOrderNumber: string | null;
  ResultDataByTestIdent: Record<string, CumulativeResultData> | null;
}

interface CumulativeTest {
  Ident: string | null;
  Name: string | null;
  Unit: string | null;
  NormalLow: number | null;
  NormalHigh: number | null;
  NormalText: string | null;
}

interface CumulativeRequest {
  Name: string | null;
  Ident: string | null;
  Tests: CumulativeTest[] | null;
}

interface CumulativeSection {
  Name: string | null;
  Requests: CumulativeRequest[] | null;
}

interface GetCumulativeResultsResponse {
  Results: CumulativeResult[] | null;
  Sections: CumulativeSection[] | null;
}

interface PatientLabTrendsData {
  testsMap: Map<string, TestInfo>;
  trendData: Map<string, TrendDataPoint[]>;
}

export function usePatientLabTrends(patientId: number | undefined) {
  return useQuery({
    queryKey: patientsKeys.labTrends(patientId),
    queryFn: async (): Promise<PatientLabTrendsData> => {
      // Step 1: Get results for patient using patientIds query parameter
      const listResponse = await axiosInstance.get<GetResultsResponse>(
        RESULTS_ENDPOINTS.LIST,
        { params: { patientIds: patientId } }
      );

      const results = listResponse.data.Results || [];
      if (results.length === 0) {
        return { testsMap: new Map(), trendData: new Map() };
      }

      // Step 2: Get cumulative data using the first result ID
      const firstResultId = results[0].Id;
      const cumulativeResponse = await axiosInstance.get<GetCumulativeResultsResponse>(
        RESULTS_ENDPOINTS.CUMULATIVE(firstResultId)
      );

      const cumulative = cumulativeResponse.data;
      const testsMap = new Map<string, TestInfo>();
      const trendData = new Map<string, TrendDataPoint[]>();

      // Build test info from Sections (contains test names, units, reference ranges)
      if (cumulative.Sections) {
        for (const section of cumulative.Sections) {
          if (!section.Requests) continue;
          for (const request of section.Requests) {
            if (!request.Tests) continue;
            for (const test of request.Tests) {
              if (!test.Ident) continue;
              if (!testsMap.has(test.Ident)) {
                testsMap.set(test.Ident, {
                  testIdent: test.Ident,
                  testName: test.Name || test.Ident,
                  unit: test.Unit,
                  normalLow: test.NormalLow,
                  normalHigh: test.NormalHigh,
                  normalText: test.NormalText,
                });
              }
            }
          }
        }
      }

      // Build trend data from cumulative Results
      if (cumulative.Results) {
        for (const result of cumulative.Results) {
          if (!result.ResultDataByTestIdent || !result.ReportDate) continue;

          for (const [testIdent, resultData] of Object.entries(result.ResultDataByTestIdent)) {
            if (resultData.Value == null) continue;

            const existing = trendData.get(testIdent) || [];
            existing.push({
              date: new Date(result.ReportDate).toLocaleDateString('de-DE'),
              dateRaw: result.ReportDate,
              value: resultData.Value,
              resultId: result.Id,
              labNo: result.LaboratoryOrderNumber || '',
            });
            trendData.set(testIdent, existing);

            // Fill test info from result data if not already known from sections
            if (!testsMap.has(testIdent)) {
              testsMap.set(testIdent, {
                testIdent,
                testName: testIdent,
                unit: resultData.Unit,
                normalLow: resultData.NormalLow,
                normalHigh: resultData.NormalHigh,
                normalText: resultData.NormalText,
              });
            }
          }
        }
      }

      // Sort trend data by date ascending
      trendData.forEach((points, key) => {
        points.sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime());
        trendData.set(key, points);
      });

      return { testsMap, trendData };
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
