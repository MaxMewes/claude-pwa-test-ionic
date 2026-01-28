import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Laboratory,
  PaginatedResponse,
  ServiceCatalogItem,
  ServiceCatalogSection,
  LaboratoryMessage,
  SendMessageRequest,
} from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockLaboratoriesData: Laboratory[] = [
  {
    id: 'lab-001',
    name: 'Labor Berlin - Charité Vivantes GmbH',
    shortName: 'Labor Berlin',
    address: {
      street: 'Sylter Strasse 2',
      city: 'Berlin',
      postalCode: '13353',
      country: 'Deutschland',
      latitude: 52.5444,
      longitude: 13.3595,
    },
    phone: '+49 30 405026-800',
    fax: '+49 30 405026-809',
    email: 'info@laborberlin.com',
    website: 'https://www.laborberlin.com',
    openingHours: [
      { day: 'Montag', open: '07:00', close: '18:00', isClosed: false },
      { day: 'Dienstag', open: '07:00', close: '18:00', isClosed: false },
      { day: 'Mittwoch', open: '07:00', close: '18:00', isClosed: false },
      { day: 'Donnerstag', open: '07:00', close: '18:00', isClosed: false },
      { day: 'Freitag', open: '07:00', close: '16:00', isClosed: false },
      { day: 'Samstag', open: '08:00', close: '12:00', isClosed: false },
      { day: 'Sonntag', open: '', close: '', isClosed: true },
    ],
    services: [
      'Klinische Chemie',
      'Haematologie',
      'Immunologie',
      'Mikrobiologie',
      'Molekulardiagnostik',
      'Pathologie',
    ],
    contacts: [
      { name: 'Dr. Maria Schmidt', position: 'Aerztliche Leiterin', phone: '+49 30 405026-801', email: 'm.schmidt@laborberlin.com' },
      { name: 'Peter Meyer', position: 'Kundenbetreuung', phone: '+49 30 405026-810', email: 'kundenservice@laborberlin.com' },
    ],
    accreditations: ['DAkkS', 'ISO 15189'],
    isActive: true,
  },
  {
    id: 'lab-002',
    name: 'MVZ Labordiagnostik GmbH',
    shortName: 'MVZ Labordiagnostik',
    address: {
      street: 'Arnulfstrasse 60',
      city: 'Muenchen',
      postalCode: '80335',
      country: 'Deutschland',
      latitude: 48.1426,
      longitude: 11.5508,
    },
    phone: '+49 89 5432-100',
    email: 'kontakt@mvz-labor.de',
    website: 'https://www.mvz-labor.de',
    openingHours: [
      { day: 'Montag', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Dienstag', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Mittwoch', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Donnerstag', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Freitag', open: '07:30', close: '15:00', isClosed: false },
      { day: 'Samstag', open: '', close: '', isClosed: true },
      { day: 'Sonntag', open: '', close: '', isClosed: true },
    ],
    services: [
      'Klinische Chemie',
      'Haematologie',
      'Endokrinologie',
      'Allergologie',
      'Infektionsserologie',
    ],
    contacts: [
      { name: 'Dr. Hans Weber', position: 'Laborleiter', phone: '+49 89 5432-101' },
      { name: 'Julia Bauer', position: 'Probenannahme', phone: '+49 89 5432-120' },
    ],
    accreditations: ['DAkkS'],
    isActive: true,
  },
  {
    id: 'lab-003',
    name: 'Synlab MVZ Muenchen',
    shortName: 'Synlab Muenchen',
    address: {
      street: 'Bayerstrasse 53',
      city: 'Muenchen',
      postalCode: '80335',
      country: 'Deutschland',
      latitude: 48.1391,
      longitude: 11.5563,
    },
    phone: '+49 89 549056-0',
    fax: '+49 89 549056-99',
    email: 'muenchen@synlab.de',
    website: 'https://www.synlab.de',
    openingHours: [
      { day: 'Montag', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Dienstag', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Mittwoch', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Donnerstag', open: '08:00', close: '18:00', isClosed: false },
      { day: 'Freitag', open: '08:00', close: '17:00', isClosed: false },
      { day: 'Samstag', open: '', close: '', isClosed: true },
      { day: 'Sonntag', open: '', close: '', isClosed: true },
    ],
    services: [
      'Klinische Chemie',
      'Haematologie',
      'Gerinnung',
      'Urinstatus',
      'Drogenscreening',
      'Genetik',
    ],
    contacts: [
      { name: 'Prof. Dr. Klaus Fischer', position: 'Medizinischer Direktor', phone: '+49 89 549056-10' },
    ],
    accreditations: ['DAkkS', 'ISO 15189', 'ISO 17025'],
    isActive: true,
  },
  {
    id: 'lab-004',
    name: 'Limbach Gruppe Hamburg',
    shortName: 'Limbach Hamburg',
    address: {
      street: 'Luebecker Strasse 128',
      city: 'Hamburg',
      postalCode: '22087',
      country: 'Deutschland',
      latitude: 53.5659,
      longitude: 10.0297,
    },
    phone: '+49 40 25077-0',
    email: 'hamburg@limbach-gruppe.de',
    website: 'https://www.limbach-gruppe.de',
    openingHours: [
      { day: 'Montag', open: '07:00', close: '17:30', isClosed: false },
      { day: 'Dienstag', open: '07:00', close: '17:30', isClosed: false },
      { day: 'Mittwoch', open: '07:00', close: '17:30', isClosed: false },
      { day: 'Donnerstag', open: '07:00', close: '17:30', isClosed: false },
      { day: 'Freitag', open: '07:00', close: '15:00', isClosed: false },
      { day: 'Samstag', open: '', close: '', isClosed: true },
      { day: 'Sonntag', open: '', close: '', isClosed: true },
    ],
    services: [
      'Klinische Chemie',
      'Haematologie',
      'Mikrobiologie',
      'Zytologie',
      'Transfusionsmedizin',
    ],
    contacts: [
      { name: 'Dr. Stefan Mueller', position: 'Laborleiter', phone: '+49 40 25077-10', email: 's.mueller@limbach-gruppe.de' },
    ],
    accreditations: ['DAkkS', 'ISO 15189'],
    isActive: true,
  },
  {
    id: 'lab-005',
    name: 'Bioscientia Labor Koeln',
    shortName: 'Bioscientia Koeln',
    address: {
      street: 'Aachener Strasse 1042',
      city: 'Koeln',
      postalCode: '50858',
      country: 'Deutschland',
      latitude: 50.9434,
      longitude: 6.8680,
    },
    phone: '+49 221 47747-0',
    fax: '+49 221 47747-99',
    email: 'koeln@bioscientia.de',
    website: 'https://www.bioscientia.de',
    openingHours: [
      { day: 'Montag', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Dienstag', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Mittwoch', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Donnerstag', open: '07:30', close: '17:00', isClosed: false },
      { day: 'Freitag', open: '07:30', close: '16:00', isClosed: false },
      { day: 'Samstag', open: '', close: '', isClosed: true },
      { day: 'Sonntag', open: '', close: '', isClosed: true },
    ],
    services: [
      'Klinische Chemie',
      'Haematologie',
      'Immunologie',
      'Humangenetik',
      'Pharmakologie',
    ],
    contacts: [
      { name: 'Dr. Lisa Hartmann', position: 'Laborleiterin', phone: '+49 221 47747-10' },
      { name: 'Thomas Klein', position: 'Qualitaetsmanagement', phone: '+49 221 47747-20' },
    ],
    accreditations: ['DAkkS', 'ISO 15189'],
    isActive: true,
  },
];

// Service Catalog Mock Data
const mockServiceCatalog: ServiceCatalogItem[] = [
  { id: 'svc-001', code: 'GLU', name: 'Glucose', shortName: 'GLU', section: 'Klinische Chemie', sectionId: 'sec-001', material: 'Serum, NaF-Plasma', method: 'Hexokinase', unit: 'mg/dL', referenceRange: '70 - 100', turnaroundTime: '1 Tag' },
  { id: 'svc-002', code: 'HBA1C', name: 'HbA1c', shortName: 'HbA1c', section: 'Klinische Chemie', sectionId: 'sec-001', material: 'EDTA-Blut', method: 'HPLC', unit: '%', referenceRange: '< 5.7', turnaroundTime: '1 Tag' },
  { id: 'svc-003', code: 'KREA', name: 'Kreatinin', shortName: 'KREA', section: 'Klinische Chemie', sectionId: 'sec-001', material: 'Serum', method: 'Jaffe', unit: 'mg/dL', referenceRange: '0.7 - 1.2', turnaroundTime: '1 Tag' },
  { id: 'svc-004', code: 'TSH', name: 'Thyreoidea-stimulierendes Hormon', shortName: 'TSH', section: 'Endokrinologie', sectionId: 'sec-002', material: 'Serum', method: 'ECLIA', unit: 'mIU/L', referenceRange: '0.4 - 4.0', turnaroundTime: '1 Tag' },
  { id: 'svc-005', code: 'FT4', name: 'Freies Thyroxin', shortName: 'fT4', section: 'Endokrinologie', sectionId: 'sec-002', material: 'Serum', method: 'ECLIA', unit: 'ng/dL', referenceRange: '0.8 - 1.8', turnaroundTime: '1 Tag' },
  { id: 'svc-006', code: 'HB', name: 'Haemoglobin', shortName: 'Hb', section: 'Haematologie', sectionId: 'sec-003', material: 'EDTA-Blut', method: 'Photometrie', unit: 'g/dL', referenceRange: '12.0 - 16.0', turnaroundTime: 'Sofort' },
  { id: 'svc-007', code: 'WBC', name: 'Leukozyten', shortName: 'WBC', section: 'Haematologie', sectionId: 'sec-003', material: 'EDTA-Blut', method: 'Impedanz', unit: '10^9/L', referenceRange: '4.0 - 10.0', turnaroundTime: 'Sofort' },
  { id: 'svc-008', code: 'PLT', name: 'Thrombozyten', shortName: 'PLT', section: 'Haematologie', sectionId: 'sec-003', material: 'EDTA-Blut', method: 'Impedanz', unit: '10^9/L', referenceRange: '150 - 400', turnaroundTime: 'Sofort' },
  { id: 'svc-009', code: 'CRP', name: 'C-reaktives Protein', shortName: 'CRP', section: 'Immunologie', sectionId: 'sec-004', material: 'Serum', method: 'Turbidimetrie', unit: 'mg/L', referenceRange: '< 5', turnaroundTime: '1 Tag' },
  { id: 'svc-010', code: 'INR', name: 'International Normalized Ratio', shortName: 'INR', section: 'Gerinnung', sectionId: 'sec-005', material: 'Citrat-Plasma', method: 'Koagulometrie', unit: '', referenceRange: '0.9 - 1.1', turnaroundTime: 'Sofort' },
];

const mockServiceSections: ServiceCatalogSection[] = [
  { id: 'sec-001', name: 'Klinische Chemie', itemCount: 3 },
  { id: 'sec-002', name: 'Endokrinologie', itemCount: 2 },
  { id: 'sec-003', name: 'Haematologie', itemCount: 3 },
  { id: 'sec-004', name: 'Immunologie', itemCount: 1 },
  { id: 'sec-005', name: 'Gerinnung', itemCount: 1 },
];

// Laboratory Messages Mock Data
const mockMessages: LaboratoryMessage[] = [
  {
    id: 'msg-001',
    laboratoryId: 'lab-001',
    name: 'Dr. Thomas Mueller',
    email: 'dr.mueller@praxis.de',
    message: 'Frage zu Befund ORD-2024-001: Koennen Sie die Leukozyten-Werte nochmals pruefen?',
    isRead: true,
    createdAt: '2024-01-15T10:30:00Z',
    response: 'Der Wert wurde bestaetigt. Eine Kontrolle in 1 Woche wird empfohlen.',
    respondedAt: '2024-01-15T14:00:00Z',
  },
];

export const mockLaboratoriesHandlers = {
  getLaboratories: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<Laboratory>>> => {
    const params = config.params as { page?: number; pageSize?: number; search?: string } || {};
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const search = params.search?.toLowerCase();

    let filtered = mockLaboratoriesData.filter((l) => l.isActive);
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.shortName.toLowerCase().includes(search) ||
          l.address.city.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * pageSize;
    const paginatedLabs = filtered.slice(start, start + pageSize);

    // labGate API v3 paginated response format
    return createMockResponse<PaginatedResponse<Laboratory>>({
      Items: paginatedLabs,
      CurrentPage: page,
      ItemsPerPage: pageSize,
      TotalItemsCount: filtered.length,
    });
  },

  getLaboratoryById: async (config: AxiosRequestConfig): Promise<AxiosResponse<Laboratory>> => {
    const id = config.url?.split('/').pop();
    const laboratory = mockLaboratoriesData.find((l) => l.id === id);

    if (!laboratory) {
      throw createMockError('Labor nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(laboratory);
  },

  getServiceCatalog: async (config: AxiosRequestConfig): Promise<AxiosResponse<{
    items: ServiceCatalogItem[];
    sections: ServiceCatalogSection[];
    total: number;
  }>> => {
    const params = config.params || {};
    const sectionId = params.sectionId;
    const query = params.query?.toLowerCase();

    let items = mockServiceCatalog;

    if (sectionId) {
      items = items.filter(i => i.sectionId === sectionId);
    }

    if (query) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.code.toLowerCase().includes(query) ||
        i.shortName?.toLowerCase().includes(query)
      );
    }

    return createMockResponse({
      items,
      sections: mockServiceSections,
      total: items.length,
    });
  },

  getServiceItem: async (config: AxiosRequestConfig): Promise<AxiosResponse<ServiceCatalogItem>> => {
    const id = config.url?.split('/').pop();
    const item = mockServiceCatalog.find(i => i.id === id);

    if (!item) {
      throw createMockError('Leistung nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(item);
  },

  sendMessage: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean; messageId: string }>> => {
    const data = config.data as SendMessageRequest;

    const newMessage: LaboratoryMessage = {
      id: `msg-${Date.now()}`,
      laboratoryId: data.laboratoryId,
      senderId: data.senderId,
      resultId: data.resultId,
      topicId: data.topicId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    mockMessages.push(newMessage);

    return createMockResponse({ success: true, messageId: newMessage.id });
  },

  getMessages: async (config: AxiosRequestConfig): Promise<AxiosResponse<LaboratoryMessage[]>> => {
    const labId = config.url?.split('/')[3];
    const messages = mockMessages.filter(m => m.laboratoryId === labId);

    return createMockResponse(messages);
  },

  markMessageAsRead: async (config: AxiosRequestConfig): Promise<AxiosResponse<{ success: boolean }>> => {
    const messageId = config.url?.split('/')[3];
    const message = mockMessages.find(m => m.id === messageId);

    if (message) {
      message.isRead = true;
    }

    return createMockResponse({ success: true });
  },
};
