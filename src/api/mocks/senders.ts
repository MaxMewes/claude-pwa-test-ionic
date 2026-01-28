import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Sender, PaginatedResponse } from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockSendersData: Sender[] = [
  {
    id: 'sender-001',
    title: 'Dr. med.',
    firstName: 'Thomas',
    lastName: 'Mueller',
    fullName: 'Dr. med. Thomas Mueller',
    siteName: 'Hausarztpraxis Mueller',
    specialField: 'Allgemeinmedizin',
    customerNo: 'KD-001',
    laboratoryId: 'lab-001',
    address: {
      street: 'Hauptstrasse 15',
      zipCode: '10115',
      city: 'Berlin',
      country: 'Deutschland',
    },
    contact: {
      phone: '+49 30 12345678',
      mobile: '+49 170 1234567',
      fax: '+49 30 12345679',
      email: 'praxis@mueller-berlin.de',
    },
  },
  {
    id: 'sender-002',
    title: 'Dr. med.',
    firstName: 'Anna',
    lastName: 'Schmidt',
    fullName: 'Dr. med. Anna Schmidt',
    siteName: 'Internistische Praxis Schmidt',
    specialField: 'Innere Medizin',
    customerNo: 'KD-002',
    laboratoryId: 'lab-002',
    address: {
      street: 'Friedrichstrasse 42',
      zipCode: '10117',
      city: 'Berlin',
      country: 'Deutschland',
    },
    contact: {
      phone: '+49 30 23456789',
      email: 'kontakt@praxis-schmidt.de',
    },
  },
  {
    id: 'sender-003',
    title: 'Dr. med.',
    firstName: 'Peter',
    lastName: 'Weber',
    fullName: 'Dr. med. Peter Weber',
    siteName: 'MVZ Kardiologie Muenchen',
    specialField: 'Kardiologie',
    customerNo: 'KD-003',
    laboratoryId: 'lab-003',
    address: {
      street: 'Marienplatz 8',
      zipCode: '80331',
      city: 'Muenchen',
      country: 'Deutschland',
    },
    contact: {
      phone: '+49 89 34567890',
      fax: '+49 89 34567891',
      email: 'info@mvz-kardio-muc.de',
    },
  },
  {
    id: 'sender-004',
    title: 'Prof. Dr. med.',
    firstName: 'Maria',
    lastName: 'Fischer',
    fullName: 'Prof. Dr. med. Maria Fischer',
    siteName: 'Uniklinik Hamburg - Endokrinologie',
    specialField: 'Endokrinologie',
    customerNo: 'KD-004',
    laboratoryId: 'lab-001',
    address: {
      street: 'Martinistrasse 52',
      zipCode: '20246',
      city: 'Hamburg',
      country: 'Deutschland',
    },
    contact: {
      phone: '+49 40 45678901',
      email: 'endokrinologie@uke.de',
    },
  },
  {
    id: 'sender-005',
    title: 'Dr. med.',
    firstName: 'Klaus',
    lastName: 'Bauer',
    fullName: 'Dr. med. Klaus Bauer',
    siteName: 'Praxis fuer Haematologie Bauer',
    specialField: 'Haematologie/Onkologie',
    customerNo: 'KD-005',
    laboratoryId: 'lab-002',
    address: {
      street: 'Koenigsallee 100',
      zipCode: '40212',
      city: 'Duesseldorf',
      country: 'Deutschland',
    },
    contact: {
      phone: '+49 211 56789012',
      mobile: '+49 171 5678901',
      email: 'praxis@haematologie-bauer.de',
    },
  },
];

export const mockSendersHandlers = {
  getSenders: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<Sender>>> => {
    const params = config.params || {};
    const page = params.currentPage || params.page || 1;
    const pageSize = params.itemsPerPage || params.pageSize || 20;
    const query = params.query?.toLowerCase() || '';

    let filtered = mockSendersData;
    if (query) {
      filtered = mockSendersData.filter(s =>
        s.fullName.toLowerCase().includes(query) ||
        s.siteName?.toLowerCase().includes(query) ||
        s.specialField?.toLowerCase().includes(query)
      );
    }

    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return createMockResponse<PaginatedResponse<Sender>>({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    });
  },

  getSenderById: async (config: AxiosRequestConfig): Promise<AxiosResponse<Sender>> => {
    const id = config.url?.split('/').pop();
    const sender = mockSendersData.find(s => s.id === id);

    if (!sender) {
      throw createMockError('Einsender nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(sender);
  },
};
