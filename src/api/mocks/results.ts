import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { LabResult, PaginatedResponse, TrendDataPoint, ResultFilter, ResultCounter, CumulativeResult } from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockResultsData: LabResult[] = [
  {
    id: 'result-001',
    patientId: 'patient-001',
    patientName: 'Max Mustermann',
    laboratoryId: 'lab-001',
    laboratoryName: 'Labor Berlin',
    senderId: 'sender-001',
    senderName: 'Dr. Thomas Mueller',
    orderNumber: 'ORD-2024-001',
    collectionDate: '2024-01-15T08:30:00Z',
    reportDate: '2024-01-15T14:00:00Z',
    status: 'final',
    resultType: 'E',
    category: 'hematology',
    isRead: false,
    isFavorite: false,
    isArchived: false,
    isPinned: true,
    tests: [
      {
        id: 'test-001',
        name: 'Haemoglobin',
        shortName: 'Hb',
        value: '14.2',
        unit: 'g/dL',
        referenceRange: '12.0 - 16.0',
        referenceMin: 12.0,
        referenceMax: 16.0,
        flag: 'normal',
        previousValue: '13.8',
        previousDate: '2023-12-15T08:30:00Z',
        trend: 'up',
      },
      {
        id: 'test-002',
        name: 'Leukozyten',
        shortName: 'WBC',
        value: '11.5',
        unit: '10^9/L',
        referenceRange: '4.0 - 10.0',
        referenceMin: 4.0,
        referenceMax: 10.0,
        flag: 'high',
        previousValue: '9.2',
        previousDate: '2023-12-15T08:30:00Z',
        trend: 'up',
      },
      {
        id: 'test-003',
        name: 'Thrombozyten',
        shortName: 'PLT',
        value: '245',
        unit: '10^9/L',
        referenceRange: '150 - 400',
        referenceMin: 150,
        referenceMax: 400,
        flag: 'normal',
      },
    ],
  },
  {
    id: 'result-002',
    patientId: 'patient-001',
    patientName: 'Max Mustermann',
    laboratoryId: 'lab-002',
    laboratoryName: 'MVZ Labordiagnostik',
    senderId: 'sender-002',
    senderName: 'Dr. Anna Schmidt',
    orderNumber: 'ORD-2024-002',
    collectionDate: '2024-01-14T09:00:00Z',
    reportDate: '2024-01-14T16:30:00Z',
    status: 'final',
    resultType: 'E',
    category: 'chemistry',
    isRead: true,
    isFavorite: true,
    isArchived: false,
    isPinned: false,
    tests: [
      {
        id: 'test-004',
        name: 'Glucose nuechtern',
        shortName: 'GLU',
        value: '126',
        unit: 'mg/dL',
        referenceRange: '70 - 100',
        referenceMin: 70,
        referenceMax: 100,
        flag: 'high',
        previousValue: '118',
        previousDate: '2023-11-20T09:00:00Z',
        trend: 'up',
      },
      {
        id: 'test-005',
        name: 'HbA1c',
        shortName: 'HbA1c',
        value: '6.8',
        unit: '%',
        referenceRange: '< 5.7',
        referenceMax: 5.7,
        flag: 'high',
      },
      {
        id: 'test-006',
        name: 'Kreatinin',
        shortName: 'KREA',
        value: '1.1',
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.2',
        referenceMin: 0.7,
        referenceMax: 1.2,
        flag: 'normal',
      },
    ],
  },
  {
    id: 'result-003',
    patientId: 'patient-002',
    patientName: 'Erika Musterfrau',
    laboratoryId: 'lab-001',
    laboratoryName: 'Labor Berlin',
    senderId: 'sender-001',
    senderName: 'Dr. Thomas Mueller',
    orderNumber: 'ORD-2024-003',
    collectionDate: '2024-01-13T10:15:00Z',
    reportDate: '2024-01-13T18:00:00Z',
    status: 'partial',
    resultType: 'T',
    category: 'immunology',
    isRead: false,
    isFavorite: false,
    isArchived: false,
    isPinned: false,
    tests: [
      {
        id: 'test-007',
        name: 'TSH',
        shortName: 'TSH',
        value: '0.35',
        unit: 'mIU/L',
        referenceRange: '0.4 - 4.0',
        referenceMin: 0.4,
        referenceMax: 4.0,
        flag: 'low',
      },
      {
        id: 'test-008',
        name: 'fT4',
        shortName: 'fT4',
        value: '1.8',
        unit: 'ng/dL',
        referenceRange: '0.8 - 1.8',
        referenceMin: 0.8,
        referenceMax: 1.8,
        flag: 'normal',
      },
    ],
  },
  {
    id: 'result-004',
    patientId: 'patient-003',
    patientName: 'Hans Schmidt',
    laboratoryId: 'lab-003',
    laboratoryName: 'Synlab Muenchen',
    senderId: 'sender-003',
    senderName: 'Dr. Peter Weber',
    orderNumber: 'ORD-2024-004',
    collectionDate: '2024-01-12T07:45:00Z',
    reportDate: '2024-01-12T15:30:00Z',
    status: 'final',
    resultType: 'E',
    category: 'coagulation',
    isRead: true,
    isFavorite: false,
    isArchived: false,
    isPinned: false,
    tests: [
      {
        id: 'test-009',
        name: 'Quick / INR',
        shortName: 'INR',
        value: '2.8',
        unit: '',
        referenceRange: '2.0 - 3.0',
        referenceMin: 2.0,
        referenceMax: 3.0,
        flag: 'normal',
      },
      {
        id: 'test-010',
        name: 'PTT',
        shortName: 'PTT',
        value: '34',
        unit: 'sec',
        referenceRange: '25 - 36',
        referenceMin: 25,
        referenceMax: 36,
        flag: 'normal',
      },
    ],
  },
  {
    id: 'result-005',
    patientId: 'patient-001',
    patientName: 'Max Mustermann',
    laboratoryId: 'lab-001',
    laboratoryName: 'Labor Berlin',
    senderId: 'sender-001',
    senderName: 'Dr. Thomas Mueller',
    orderNumber: 'ORD-2024-005',
    collectionDate: '2024-01-10T08:00:00Z',
    reportDate: '2024-01-10T12:00:00Z',
    status: 'corrected',
    resultType: 'N',
    category: 'urinalysis',
    isRead: true,
    isFavorite: false,
    isArchived: true,
    isPinned: false,
    tests: [
      {
        id: 'test-011',
        name: 'pH',
        shortName: 'pH',
        value: '6.0',
        unit: '',
        referenceRange: '5.0 - 8.0',
        referenceMin: 5.0,
        referenceMax: 8.0,
        flag: 'normal',
      },
      {
        id: 'test-012',
        name: 'Protein',
        shortName: 'PROT',
        value: 'negativ',
        unit: '',
        referenceRange: 'negativ',
        flag: 'normal',
      },
      {
        id: 'test-013',
        name: 'Glucose',
        shortName: 'GLU-U',
        value: 'positiv',
        unit: '',
        referenceRange: 'negativ',
        flag: 'abnormal',
      },
    ],
  },
  {
    id: 'result-006',
    patientId: 'patient-004',
    patientName: 'Anna Weber',
    laboratoryId: 'lab-002',
    laboratoryName: 'MVZ Labordiagnostik',
    senderId: 'sender-002',
    senderName: 'Dr. Anna Schmidt',
    orderNumber: 'ORD-2024-006',
    collectionDate: '2024-01-08T11:30:00Z',
    reportDate: '2024-01-09T09:00:00Z',
    status: 'final',
    resultType: 'E',
    category: 'microbiology',
    isRead: false,
    isFavorite: false,
    isArchived: false,
    isPinned: false,
    tests: [
      {
        id: 'test-014',
        name: 'Urinkultur',
        shortName: 'UKULT',
        value: 'E. coli > 10^5 KBE/ml',
        unit: '',
        referenceRange: 'steril',
        flag: 'abnormal',
      },
    ],
  },
];

const trendData: Record<string, TrendDataPoint[]> = {
  'test-001': [
    { date: '2023-06-15', value: 13.5 },
    { date: '2023-08-15', value: 13.2 },
    { date: '2023-10-15', value: 13.6 },
    { date: '2023-12-15', value: 13.8 },
    { date: '2024-01-15', value: 14.2 },
  ],
  'test-002': [
    { date: '2023-06-15', value: 7.8 },
    { date: '2023-08-15', value: 8.2 },
    { date: '2023-10-15', value: 8.9 },
    { date: '2023-12-15', value: 9.2 },
    { date: '2024-01-15', value: 11.5 },
  ],
  'test-004': [
    { date: '2023-05-20', value: 105 },
    { date: '2023-07-20', value: 110 },
    { date: '2023-09-20', value: 115 },
    { date: '2023-11-20', value: 118 },
    { date: '2024-01-14', value: 126 },
  ],
};

function applyFilter(results: LabResult[], filter: ResultFilter): LabResult[] {
  let filtered = results.filter((result) => {
    if (filter.patientId && result.patientId !== filter.patientId) return false;
    if (filter.patientIds?.length && !filter.patientIds.includes(result.patientId)) return false;
    if (filter.laboratoryId && result.laboratoryId !== filter.laboratoryId) return false;
    if (filter.senderId && result.senderId !== filter.senderId) return false;
    if (filter.senderIds?.length && !filter.senderIds.includes(result.senderId || '')) return false;
    if (filter.status?.length && !filter.status.includes(result.status)) return false;
    if (filter.resultType?.length && !filter.resultType.includes(result.resultType)) return false;
    if (filter.category?.length && !filter.category.includes(result.category)) return false;
    if (filter.isRead !== undefined && result.isRead !== filter.isRead) return false;
    if (filter.isFavorite !== undefined && result.isFavorite !== filter.isFavorite) return false;
    if (filter.isArchived !== undefined && result.isArchived !== filter.isArchived) return false;
    if (filter.isPinned !== undefined && result.isPinned !== filter.isPinned) return false;
    if (filter.dateFrom && new Date(result.reportDate) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(result.reportDate) > new Date(filter.dateTo)) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesPatient = result.patientName.toLowerCase().includes(searchLower);
      const matchesLab = result.laboratoryName.toLowerCase().includes(searchLower);
      const matchesOrder = result.orderNumber.toLowerCase().includes(searchLower);
      const matchesSender = result.senderName?.toLowerCase().includes(searchLower);
      if (!matchesPatient && !matchesLab && !matchesOrder && !matchesSender) return false;
    }
    // Area filter
    if (filter.area) {
      const hasAbnormal = result.tests.some(t => t.flag !== 'normal');
      const hasCritical = result.tests.some(t => t.flag === 'critical_low' || t.flag === 'critical_high');
      switch (filter.area) {
        case 'new': if (result.isRead) return false; break;
        case 'pathological': if (!hasAbnormal) return false; break;
        case 'urgent': if (!hasCritical) return false; break;
      }
    }
    return true;
  });

  // Sorting
  if (filter.sortColumn) {
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (filter.sortColumn) {
        case 'reportDate': aVal = new Date(a.reportDate); bVal = new Date(b.reportDate); break;
        case 'patientName': aVal = a.patientName; bVal = b.patientName; break;
        default: aVal = a.reportDate; bVal = b.reportDate;
      }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filter.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  return filtered;
}

export const mockResultsHandlers = {
  getResults: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<LabResult>>> => {
    const params = config.params as ResultFilter & { page?: number; pageSize?: number } || {};
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const filteredResults = applyFilter(mockResultsData, params);
    const start = (page - 1) * pageSize;
    const paginatedResults = filteredResults.slice(start, start + pageSize);

    return createMockResponse<PaginatedResponse<LabResult>>({
      data: paginatedResults,
      total: filteredResults.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredResults.length / pageSize),
    });
  },

  getResultById: async (config: AxiosRequestConfig): Promise<AxiosResponse<LabResult>> => {
    const id = config.url?.split('/').pop();
    const result = (mockResultsData).find((r) => r.id === id);

    if (!result) {
      throw createMockError('Befund nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(result);
  },

  getTrend: async (config: AxiosRequestConfig): Promise<AxiosResponse<TrendDataPoint[]>> => {
    const urlParts = config.url?.split('/') || [];
    const testId = urlParts[urlParts.length - 1];

    const data = trendData[testId] || [];
    return createMockResponse(data);
  },

  markAsRead: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const id = config.url?.split('/')[2];
    const result = (mockResultsData).find((r) => r.id === id);
    if (result) {
      result.isRead = true;
    }
    return createMockResponse({ success: true });
  },

  togglePin: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ isPinned: boolean }>> => {
    const id = config.url?.split('/')[2];
    const result = (mockResultsData).find((r) => r.id === id);
    if (result) {
      result.isPinned = !result.isPinned;
      return createMockResponse({ isPinned: result.isPinned });
    }
    throw createMockError('Befund nicht gefunden', 404, 'NOT_FOUND');
  },

  markAsFavorite: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as string[];
    ids.forEach(id => {
      const result = mockResultsData.find(r => r.id === id);
      if (result) result.isFavorite = true;
    });
    return createMockResponse({ success: true });
  },

  markAsNotFavorite: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as string[];
    ids.forEach(id => {
      const result = mockResultsData.find(r => r.id === id);
      if (result) result.isFavorite = false;
    });
    return createMockResponse({ success: true });
  },

  markAsArchived: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as string[];
    ids.forEach(id => {
      const result = mockResultsData.find(r => r.id === id);
      if (result) result.isArchived = true;
    });
    return createMockResponse({ success: true });
  },

  markAsNotArchived: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as string[];
    ids.forEach(id => {
      const result = mockResultsData.find(r => r.id === id);
      if (result) result.isArchived = false;
    });
    return createMockResponse({ success: true });
  },

  markAsUnread: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const ids = config.data as string[];
    ids.forEach(id => {
      const result = mockResultsData.find(r => r.id === id);
      if (result) result.isRead = false;
    });
    return createMockResponse({ success: true });
  },

  getCounter: async (): Promise<AxiosResponse<ResultCounter>> => {
    const counter: ResultCounter = {
      total: mockResultsData.length,
      new: mockResultsData.filter(r => !r.isRead).length,
      pathological: mockResultsData.filter(r => r.tests.some(t => t.flag !== 'normal')).length,
      urgent: mockResultsData.filter(r => r.tests.some(t => t.flag === 'critical_low' || t.flag === 'critical_high')).length,
      highPathological: mockResultsData.filter(r => r.tests.some(t => t.flag === 'critical_low' || t.flag === 'critical_high')).length,
    };
    return createMockResponse(counter);
  },

  getCumulative: async (config: AxiosRequestConfig): Promise<AxiosResponse<CumulativeResult[]>> => {
    const resultId = config.url?.split('/')[3];
    const result = mockResultsData.find(r => r.id === resultId);

    if (!result) {
      throw createMockError('Befund nicht gefunden', 404, 'NOT_FOUND');
    }

    const cumulative: CumulativeResult[] = result.tests.map(test => ({
      testName: test.name,
      unit: test.unit,
      referenceMin: test.referenceMin,
      referenceMax: test.referenceMax,
      history: trendData[test.id] || [{ date: result.reportDate.split('T')[0], value: parseFloat(test.value) || 0 }],
    }));

    return createMockResponse(cumulative);
  },
};
