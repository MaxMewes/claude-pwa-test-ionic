import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Laboratory, PaginatedResponse } from '../types';
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
    isActive: true,
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

    return createMockResponse<PaginatedResponse<Laboratory>>({
      data: paginatedLabs,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
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
};
