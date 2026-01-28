import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { LabResult, PaginatedResponse, TrendDataPoint, ResultFilter, ResultCounter, CumulativeResult, TestResult, TestResultHistory } from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

// labGate API v3 format mock data
const mockResultsData: LabResult[] = [
  {
    Id: 1001,
    LabNo: 'LAB-2024-001',
    Patient: {
      Id: 1,
      Fullname: 'Max Mustermann',
      PatientNumber: 'PAT-001',
      DateOfBirth: '1985-03-15',
    },
    Sender: {
      Id: 1,
      Name: 'Dr. Thomas Mueller',
      CustomerNo: 'CUST-001',
    },
    Laboratory: {
      Id: 1,
      Name: 'Labor Berlin',
    },
    ReportDate: '2024-01-15T14:00:00Z',
    Status: 'final',
    ResultType: 'E',
    LaboratorySection: 'Haematologie',
    IsFavorite: false,
    IsRead: false,
    IsArchived: false,
    IsConfirmable: false,
    ResultData: [
      {
        Id: 1,
        TestIdent: 'HB',
        TestName: 'Haemoglobin',
        Value: '14.2',
        Unit: 'g/dL',
        ReferenceRange: '12.0 - 16.0',
        ReferenceMin: 12.0,
        ReferenceMax: 16.0,
        IsPathological: false,
        PathologyIndicator: '',
      },
      {
        Id: 2,
        TestIdent: 'WBC',
        TestName: 'Leukozyten',
        Value: '11.5',
        Unit: '10^9/L',
        ReferenceRange: '4.0 - 10.0',
        ReferenceMin: 4.0,
        ReferenceMax: 10.0,
        IsPathological: true,
        PathologyIndicator: 'H',
      },
      {
        Id: 3,
        TestIdent: 'PLT',
        TestName: 'Thrombozyten',
        Value: '245',
        Unit: '10^9/L',
        ReferenceRange: '150 - 400',
        ReferenceMin: 150,
        ReferenceMax: 400,
        IsPathological: false,
      },
    ],
  },
  {
    Id: 1002,
    LabNo: 'LAB-2024-002',
    Patient: {
      Id: 1,
      Fullname: 'Max Mustermann',
      PatientNumber: 'PAT-001',
      DateOfBirth: '1985-03-15',
    },
    Sender: {
      Id: 2,
      Name: 'Dr. Anna Schmidt',
      CustomerNo: 'CUST-002',
    },
    Laboratory: {
      Id: 2,
      Name: 'MVZ Labordiagnostik',
    },
    ReportDate: '2024-01-14T16:30:00Z',
    Status: 'final',
    ResultType: 'E',
    LaboratorySection: 'Klinische Chemie',
    IsFavorite: true,
    IsRead: true,
    IsArchived: false,
    IsConfirmable: true,
    ResultData: [
      {
        Id: 4,
        TestIdent: 'GLU',
        TestName: 'Glucose nuechtern',
        Value: '126',
        Unit: 'mg/dL',
        ReferenceRange: '70 - 100',
        ReferenceMin: 70,
        ReferenceMax: 100,
        IsPathological: true,
        PathologyIndicator: 'H',
      },
      {
        Id: 5,
        TestIdent: 'HBA1C',
        TestName: 'HbA1c',
        Value: '6.8',
        Unit: '%',
        ReferenceRange: '< 5.7',
        ReferenceMax: 5.7,
        IsPathological: true,
        PathologyIndicator: 'H',
      },
      {
        Id: 6,
        TestIdent: 'KREA',
        TestName: 'Kreatinin',
        Value: '1.1',
        Unit: 'mg/dL',
        ReferenceRange: '0.7 - 1.2',
        ReferenceMin: 0.7,
        ReferenceMax: 1.2,
        IsPathological: false,
      },
    ],
  },
  {
    Id: 1003,
    LabNo: 'LAB-2024-003',
    Patient: {
      Id: 2,
      Fullname: 'Erika Musterfrau',
      PatientNumber: 'PAT-002',
      DateOfBirth: '1990-07-22',
    },
    Sender: {
      Id: 1,
      Name: 'Dr. Thomas Mueller',
      CustomerNo: 'CUST-001',
    },
    Laboratory: {
      Id: 1,
      Name: 'Labor Berlin',
    },
    ReportDate: '2024-01-13T18:00:00Z',
    Status: 'partial',
    ResultType: 'T',
    LaboratorySection: 'Immunologie',
    IsFavorite: false,
    IsRead: false,
    IsArchived: false,
    IsConfirmable: false,
    ResultData: [
      {
        Id: 7,
        TestIdent: 'TSH',
        TestName: 'TSH',
        Value: '0.35',
        Unit: 'mIU/L',
        ReferenceRange: '0.4 - 4.0',
        ReferenceMin: 0.4,
        ReferenceMax: 4.0,
        IsPathological: true,
        PathologyIndicator: 'L',
      },
      {
        Id: 8,
        TestIdent: 'FT4',
        TestName: 'fT4',
        Value: '1.8',
        Unit: 'ng/dL',
        ReferenceRange: '0.8 - 1.8',
        ReferenceMin: 0.8,
        ReferenceMax: 1.8,
        IsPathological: false,
      },
    ],
  },
  {
    Id: 1004,
    LabNo: 'LAB-2024-004',
    Patient: {
      Id: 3,
      Fullname: 'Hans Schmidt',
      PatientNumber: 'PAT-003',
      DateOfBirth: '1972-11-08',
    },
    Sender: {
      Id: 3,
      Name: 'Dr. Peter Weber',
      CustomerNo: 'CUST-003',
    },
    Laboratory: {
      Id: 3,
      Name: 'Synlab Muenchen',
    },
    ReportDate: '2024-01-12T15:30:00Z',
    Status: 'final',
    ResultType: 'E',
    LaboratorySection: 'Gerinnung',
    IsFavorite: false,
    IsRead: true,
    IsArchived: false,
    IsConfirmable: false,
    ResultData: [
      {
        Id: 9,
        TestIdent: 'INR',
        TestName: 'Quick / INR',
        Value: '2.8',
        Unit: '',
        ReferenceRange: '2.0 - 3.0',
        ReferenceMin: 2.0,
        ReferenceMax: 3.0,
        IsPathological: false,
      },
      {
        Id: 10,
        TestIdent: 'PTT',
        TestName: 'PTT',
        Value: '34',
        Unit: 'sec',
        ReferenceRange: '25 - 36',
        ReferenceMin: 25,
        ReferenceMax: 36,
        IsPathological: false,
      },
    ],
  },
  {
    Id: 1005,
    LabNo: 'LAB-2024-005',
    Patient: {
      Id: 1,
      Fullname: 'Max Mustermann',
      PatientNumber: 'PAT-001',
      DateOfBirth: '1985-03-15',
    },
    Sender: {
      Id: 1,
      Name: 'Dr. Thomas Mueller',
      CustomerNo: 'CUST-001',
    },
    Laboratory: {
      Id: 1,
      Name: 'Labor Berlin',
    },
    ReportDate: '2024-01-10T12:00:00Z',
    Status: 'corrected',
    ResultType: 'N',
    LaboratorySection: 'Urindiagnostik',
    IsFavorite: false,
    IsRead: true,
    IsArchived: true,
    IsConfirmable: false,
    ResultData: [
      {
        Id: 11,
        TestIdent: 'PH',
        TestName: 'pH',
        Value: '6.0',
        Unit: '',
        ReferenceRange: '5.0 - 8.0',
        ReferenceMin: 5.0,
        ReferenceMax: 8.0,
        IsPathological: false,
      },
      {
        Id: 12,
        TestIdent: 'PROT',
        TestName: 'Protein',
        Value: 'negativ',
        Unit: '',
        ReferenceRange: 'negativ',
        IsPathological: false,
      },
      {
        Id: 13,
        TestIdent: 'GLU-U',
        TestName: 'Glucose',
        Value: 'positiv',
        Unit: '',
        ReferenceRange: 'negativ',
        IsPathological: true,
        PathologyIndicator: 'A',
      },
    ],
  },
  {
    Id: 1006,
    LabNo: 'LAB-2024-006',
    Patient: {
      Id: 4,
      Fullname: 'Anna Weber',
      PatientNumber: 'PAT-004',
      DateOfBirth: '1995-02-28',
    },
    Sender: {
      Id: 2,
      Name: 'Dr. Anna Schmidt',
      CustomerNo: 'CUST-002',
    },
    Laboratory: {
      Id: 2,
      Name: 'MVZ Labordiagnostik',
    },
    ReportDate: '2024-01-09T09:00:00Z',
    Status: 'final',
    ResultType: 'E',
    LaboratorySection: 'Mikrobiologie',
    IsFavorite: false,
    IsRead: false,
    IsArchived: false,
    IsConfirmable: true,
    ResultData: [
      {
        Id: 14,
        TestIdent: 'UKULT',
        TestName: 'Urinkultur',
        Value: 'E. coli > 10^5 KBE/ml',
        Unit: '',
        ReferenceRange: 'steril',
        IsPathological: true,
        PathologyIndicator: 'A',
        Comment: 'Antibiogramm folgt',
      },
    ],
  },
];

const trendData: Record<number, TestResultHistory[]> = {
  1: [
    { Date: '2023-06-15', Value: '13.5', NumericValue: 13.5, IsPathological: false },
    { Date: '2023-08-15', Value: '13.2', NumericValue: 13.2, IsPathological: false },
    { Date: '2023-10-15', Value: '13.6', NumericValue: 13.6, IsPathological: false },
    { Date: '2023-12-15', Value: '13.8', NumericValue: 13.8, IsPathological: false },
    { Date: '2024-01-15', Value: '14.2', NumericValue: 14.2, IsPathological: false },
  ],
  2: [
    { Date: '2023-06-15', Value: '7.8', NumericValue: 7.8, IsPathological: false },
    { Date: '2023-08-15', Value: '8.2', NumericValue: 8.2, IsPathological: false },
    { Date: '2023-10-15', Value: '8.9', NumericValue: 8.9, IsPathological: false },
    { Date: '2023-12-15', Value: '9.2', NumericValue: 9.2, IsPathological: false },
    { Date: '2024-01-15', Value: '11.5', NumericValue: 11.5, IsPathological: true },
  ],
  4: [
    { Date: '2023-05-20', Value: '105', NumericValue: 105, IsPathological: true },
    { Date: '2023-07-20', Value: '110', NumericValue: 110, IsPathological: true },
    { Date: '2023-09-20', Value: '115', NumericValue: 115, IsPathological: true },
    { Date: '2023-11-20', Value: '118', NumericValue: 118, IsPathological: true },
    { Date: '2024-01-14', Value: '126', NumericValue: 126, IsPathological: true },
  ],
};

function applyFilter(results: LabResult[], filter: ResultFilter): LabResult[] {
  let filtered = results.filter((result) => {
    // Filter by patient
    if (filter.patientId && result.Patient.Id.toString() !== filter.patientId) return false;
    if (filter.patientIds?.length && !filter.patientIds.includes(result.Patient.Id.toString())) return false;

    // Filter by laboratory
    if (filter.laboratoryId && result.Laboratory?.Id.toString() !== filter.laboratoryId) return false;

    // Filter by sender
    if (filter.senderId && result.Sender?.Id.toString() !== filter.senderId) return false;
    if (filter.senderIds?.length && !filter.senderIds.includes(result.Sender?.Id.toString() || '')) return false;

    // Filter by status
    if (filter.status?.length && !filter.status.includes(result.Status as any)) return false;

    // Filter by result type
    if (filter.resultType?.length && !filter.resultType.includes(result.ResultType as any)) return false;

    // Filter by flags
    if (filter.isRead !== undefined && result.IsRead !== filter.isRead) return false;
    if (filter.isFavorite !== undefined && result.IsFavorite !== filter.isFavorite) return false;
    if (filter.isArchived !== undefined && result.IsArchived !== filter.isArchived) return false;

    // Filter by date range
    if (filter.dateFrom && new Date(result.ReportDate) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(result.ReportDate) > new Date(filter.dateTo)) return false;

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesPatient = result.Patient.Fullname.toLowerCase().includes(searchLower);
      const matchesLab = result.Laboratory?.Name.toLowerCase().includes(searchLower);
      const matchesLabNo = result.LabNo.toLowerCase().includes(searchLower);
      const matchesSender = result.Sender?.Name.toLowerCase().includes(searchLower);
      if (!matchesPatient && !matchesLab && !matchesLabNo && !matchesSender) return false;
    }

    // Area filter
    if (filter.area) {
      const hasPathological = result.ResultData?.some(t => t.IsPathological) ?? false;
      switch (filter.area) {
        case 'new': if (result.IsRead) return false; break;
        case 'pathological': if (!hasPathological) return false; break;
        case 'urgent': if (!hasPathological) return false; break; // Use pathological for urgent too
      }
    }
    return true;
  });

  // Sorting
  if (filter.sortColumn) {
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (filter.sortColumn) {
        case 'reportDate':
        case 'ReportDate':
          aVal = new Date(a.ReportDate);
          bVal = new Date(b.ReportDate);
          break;
        case 'patientName':
        case 'Patient.Fullname':
          aVal = a.Patient.Fullname;
          bVal = b.Patient.Fullname;
          break;
        default:
          aVal = new Date(a.ReportDate);
          bVal = new Date(b.ReportDate);
      }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filter.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  return filtered;
}

export const mockResultsHandlers = {
  getResults: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<LabResult>>> => {
    const params = config.params as ResultFilter & { page?: number; pageSize?: number; CurrentPage?: number; ItemsPerPage?: number } || {};
    const page = params.CurrentPage || params.page || 1;
    const pageSize = params.ItemsPerPage || params.pageSize || 10;

    const filteredResults = applyFilter(mockResultsData, params);
    const start = (page - 1) * pageSize;
    const paginatedResults = filteredResults.slice(start, start + pageSize);

    // labGate API v3 paginated response format
    return createMockResponse<PaginatedResponse<LabResult>>({
      Items: paginatedResults,
      CurrentPage: page,
      ItemsPerPage: pageSize,
      TotalItemsCount: filteredResults.length,
    });
  },

  getResultById: async (config: AxiosRequestConfig): Promise<AxiosResponse<LabResult>> => {
    const id = parseInt(config.url?.split('/').pop() || '0');
    const result = mockResultsData.find((r) => r.Id === id);

    if (!result) {
      throw createMockError('Befund nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(result);
  },

  getTrend: async (config: AxiosRequestConfig): Promise<AxiosResponse<TestResultHistory[]>> => {
    const urlParts = config.url?.split('/') || [];
    const testId = parseInt(urlParts[urlParts.length - 1] || '0');

    const data = trendData[testId] || [];
    return createMockResponse(data);
  },

  markAsRead: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as number[];
    ids?.forEach(id => {
      const result = mockResultsData.find((r) => r.Id === id);
      if (result) {
        result.IsRead = true;
      }
    });
    return createMockResponse({ success: true });
  },

  togglePin: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ isPinned: boolean }>> => {
    const id = parseInt(config.url?.split('/')[4] || '0');
    const result = mockResultsData.find((r) => r.Id === id);
    if (result) {
      // Toggle isPinned via legacy field
      const current = result.isPinned ?? false;
      result.isPinned = !current;
      return createMockResponse({ isPinned: result.isPinned });
    }
    throw createMockError('Befund nicht gefunden', 404, 'NOT_FOUND');
  },

  markAsFavorite: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as number[];
    ids?.forEach(id => {
      const result = mockResultsData.find(r => r.Id === id);
      if (result) result.IsFavorite = true;
    });
    return createMockResponse({ success: true });
  },

  markAsNotFavorite: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as number[];
    ids?.forEach(id => {
      const result = mockResultsData.find(r => r.Id === id);
      if (result) result.IsFavorite = false;
    });
    return createMockResponse({ success: true });
  },

  markAsArchived: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as number[];
    ids?.forEach(id => {
      const result = mockResultsData.find(r => r.Id === id);
      if (result) result.IsArchived = true;
    });
    return createMockResponse({ success: true });
  },

  markAsNotArchived: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as number[];
    ids?.forEach(id => {
      const result = mockResultsData.find(r => r.Id === id);
      if (result) result.IsArchived = false;
    });
    return createMockResponse({ success: true });
  },

  markAsUnread: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as number[];
    ids?.forEach(id => {
      const result = mockResultsData.find(r => r.Id === id);
      if (result) result.IsRead = false;
    });
    return createMockResponse({ success: true });
  },

  getCounter: async (): Promise<AxiosResponse<ResultCounter>> => {
    // labGate API v3 counter format
    const counter: ResultCounter = {
      Total: mockResultsData.length,
      New: mockResultsData.filter(r => !r.IsRead).length,
      Pathological: mockResultsData.filter(r => r.ResultData?.some(t => t.IsPathological)).length,
      Urgent: mockResultsData.filter(r => r.ResultData?.some(t => t.PathologyIndicator === 'HH' || t.PathologyIndicator === 'LL')).length,
      HighPathological: mockResultsData.filter(r => r.ResultData?.some(t => t.PathologyIndicator === 'HH' || t.PathologyIndicator === 'LL')).length,
    };
    return createMockResponse(counter);
  },

  getCumulative: async (config: AxiosRequestConfig): Promise<AxiosResponse<CumulativeResult[]>> => {
    const resultId = parseInt(config.url?.split('/')[4] || '0');
    const result = mockResultsData.find(r => r.Id === resultId);

    if (!result) {
      throw createMockError('Befund nicht gefunden', 404, 'NOT_FOUND');
    }

    const cumulative: CumulativeResult[] = (result.ResultData || []).map(test => ({
      testName: test.TestName,
      unit: test.Unit || '',
      referenceMin: test.ReferenceMin,
      referenceMax: test.ReferenceMax,
      history: (trendData[test.Id] || [{ Date: result.ReportDate.split('T')[0], Value: test.Value, NumericValue: parseFloat(test.Value) || 0, IsPathological: test.IsPathological }])
        .map(h => ({ date: h.Date, value: h.NumericValue || parseFloat(h.Value) || 0 })),
    }));

    return createMockResponse(cumulative);
  },
};
