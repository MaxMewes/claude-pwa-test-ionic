import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Patient, PaginatedResponse, LabResult } from '../types';
import { createMockResponse, createMockError } from '../client/mockAdapter';

const mockPatientsData: Patient[] = [
  {
    id: 'patient-001',
    firstName: 'Max',
    lastName: 'Mustermann',
    dateOfBirth: '1975-03-15',
    gender: 'male',
    insuranceNumber: 'A123456789',
    email: 'max.mustermann@email.de',
    phone: '+49 170 1234567',
    address: {
      street: 'Musterstrasse 123',
      city: 'Berlin',
      postalCode: '10115',
      country: 'Deutschland',
    },
    lastVisit: '2024-01-15',
    resultCount: 12,
  },
  {
    id: 'patient-002',
    firstName: 'Erika',
    lastName: 'Musterfrau',
    dateOfBirth: '1982-07-22',
    gender: 'female',
    insuranceNumber: 'B987654321',
    email: 'erika.musterfrau@email.de',
    phone: '+49 171 9876543',
    address: {
      street: 'Beispielweg 45',
      city: 'Muenchen',
      postalCode: '80331',
      country: 'Deutschland',
    },
    lastVisit: '2024-01-13',
    resultCount: 5,
  },
  {
    id: 'patient-003',
    firstName: 'Hans',
    lastName: 'Schmidt',
    dateOfBirth: '1960-11-08',
    gender: 'male',
    insuranceNumber: 'C456789012',
    email: 'hans.schmidt@email.de',
    phone: '+49 172 4567890',
    address: {
      street: 'Hauptstrasse 78',
      city: 'Hamburg',
      postalCode: '20095',
      country: 'Deutschland',
    },
    lastVisit: '2024-01-12',
    resultCount: 23,
  },
  {
    id: 'patient-004',
    firstName: 'Anna',
    lastName: 'Weber',
    dateOfBirth: '1990-05-30',
    gender: 'female',
    insuranceNumber: 'D234567890',
    email: 'anna.weber@email.de',
    phone: '+49 173 2345678',
    address: {
      street: 'Nebenweg 12',
      city: 'Koeln',
      postalCode: '50667',
      country: 'Deutschland',
    },
    lastVisit: '2024-01-08',
    resultCount: 8,
  },
  {
    id: 'patient-005',
    firstName: 'Peter',
    lastName: 'Braun',
    dateOfBirth: '1955-09-14',
    gender: 'male',
    insuranceNumber: 'E567890123',
    phone: '+49 174 5678901',
    address: {
      street: 'Gartenstrasse 34',
      city: 'Frankfurt',
      postalCode: '60311',
      country: 'Deutschland',
    },
    lastVisit: '2024-01-05',
    resultCount: 31,
  },
  {
    id: 'patient-006',
    firstName: 'Maria',
    lastName: 'Koch',
    dateOfBirth: '1988-02-28',
    gender: 'female',
    insuranceNumber: 'F890123456',
    email: 'maria.koch@email.de',
    phone: '+49 175 8901234',
    address: {
      street: 'Parkweg 56',
      city: 'Stuttgart',
      postalCode: '70173',
      country: 'Deutschland',
    },
    lastVisit: '2024-01-03',
    resultCount: 4,
  },
];

export const mockPatientsHandlers = {
  getPatients: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<Patient>>> => {
    const params = config.params as { page?: number; pageSize?: number; search?: string } || {};
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const search = params.search?.toLowerCase();

    let filtered = mockPatientsData;
    if (search) {
      filtered = mockPatientsData.filter(
        (p) =>
          p.firstName.toLowerCase().includes(search) ||
          p.lastName.toLowerCase().includes(search) ||
          p.insuranceNumber?.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * pageSize;
    const paginatedPatients = filtered.slice(start, start + pageSize);

    // labGate API v3 paginated response format
    return createMockResponse<PaginatedResponse<Patient>>({
      Items: paginatedPatients,
      CurrentPage: page,
      ItemsPerPage: pageSize,
      TotalItemsCount: filtered.length,
    });
  },

  getPatientById: async (config: AxiosRequestConfig): Promise<AxiosResponse<Patient>> => {
    const id = config.url?.split('/').pop();
    const patient = mockPatientsData.find((p) => p.id === id);

    if (!patient) {
      throw createMockError('Patient nicht gefunden', 404, 'NOT_FOUND');
    }

    return createMockResponse(patient);
  },

  getPatientResults: async (config: AxiosRequestConfig): Promise<AxiosResponse<PaginatedResponse<LabResult>>> => {
    const urlParts = config.url?.split('/') || [];
    const patientId = urlParts[urlParts.length - 2];

    // Return empty results for now - actual implementation would filter results
    // labGate API v3 paginated response format
    return createMockResponse<PaginatedResponse<LabResult>>({
      Items: [],
      CurrentPage: 1,
      ItemsPerPage: 10,
      TotalItemsCount: 0,
    });
  },
};
