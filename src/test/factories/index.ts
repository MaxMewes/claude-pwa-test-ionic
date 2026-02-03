/**
 * Test Data Factories
 *
 * Use these factories to create mock data for tests.
 * Each factory returns a complete object with default values that can be overridden.
 */

import type { User } from '../../features/auth/store/authStore';
import type { LabResult, Patient, ResultPatient } from '../../api/types';

// Counter for unique IDs
let idCounter = 1;
const getNextId = () => idCounter++;

/**
 * Reset ID counter between tests
 */
export function resetIdCounter() {
  idCounter = 1;
}

/**
 * Create a mock User
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  const id = getNextId();
  return {
    id: `user-${id}`,
    email: `user${id}@test.com`,
    username: `testuser${id}`,
    firstName: 'Test',
    lastName: `User${id}`,
    role: 'doctor',
    permissions: ['read:results', 'read:patients'],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock Patient
 */
export function createMockPatient(overrides: Partial<Patient> = {}): Patient {
  const id = overrides.Id ?? getNextId();
  return {
    Id: id,
    Firstname: `Max`,
    Lastname: `Mustermann${id}`,
    Fullname: `Max Mustermann${id}`,
    Birthdate: '1980-01-15',
    Gender: 'M',
    InsuranceNumber: `INS${id.toString().padStart(8, '0')}`,
    ...overrides,
  } as Patient;
}

/**
 * Create a mock ResultPatient (used in LabResult.Patient)
 * This type has Id as required (not optional)
 */
export function createMockResultPatient(overrides: Partial<ResultPatient> & { Id?: number } = {}): ResultPatient {
  const id = overrides.Id ?? getNextId();
  return {
    Id: id,
    Firstname: `Max`,
    Lastname: `Mustermann${id}`,
    Fullname: `Max Mustermann${id}`,
    ...overrides,
  };
}

/**
 * Create a mock LabResult
 */
export function createMockLabResult(overrides: Partial<LabResult> = {}): LabResult {
  const id = overrides.Id ?? getNextId();
  const patient = overrides.Patient ?? createMockResultPatient();

  return {
    Id: id,
    LabNo: `LAB-${id.toString().padStart(6, '0')}`,
    ReportDate: new Date().toISOString(),
    IsRead: false,
    IsPatho: false,
    IsHighPatho: false,
    IsEmergency: false,
    IsFavorite: false,
    Patient: patient,
    Sender: {
      Id: 1,
      Name: 'Testlabor',
    },
    ...overrides,
  } as LabResult;
}

/**
 * Create multiple mock LabResults
 */
export function createMockLabResults(count: number, overrides: Partial<LabResult> = {}): LabResult[] {
  return Array.from({ length: count }, () => createMockLabResult(overrides));
}

/**
 * Create a mock LabResult with pathological values
 */
export function createMockPathologicalResult(overrides: Partial<LabResult> = {}): LabResult {
  return createMockLabResult({
    IsPatho: true,
    ...overrides,
  });
}

/**
 * Create a mock LabResult marked as urgent
 */
export function createMockUrgentResult(overrides: Partial<LabResult> = {}): LabResult {
  return createMockLabResult({
    IsEmergency: true,
    IsHighPatho: true,
    ...overrides,
  });
}

/**
 * Create a mock unread LabResult
 */
export function createMockUnreadResult(overrides: Partial<LabResult> = {}): LabResult {
  return createMockLabResult({
    IsRead: false,
    ...overrides,
  });
}

/**
 * Create mock login credentials
 */
export function createMockCredentials(overrides: { username?: string; password?: string } = {}) {
  return {
    username: overrides.username ?? 'testuser@test.com',
    password: overrides.password ?? 'TestPassword123!',
  };
}

/**
 * Create mock API response for paginated results
 */
export function createMockPaginatedResponse<T>(
  items: T[],
  options: { page?: number; itemsPerPage?: number; totalItems?: number } = {}
) {
  const page = options.page ?? 1;
  const itemsPerPage = options.itemsPerPage ?? 20;
  const totalItems = options.totalItems ?? items.length;

  return {
    Results: items,
    Page: page,
    ItemsPerPage: itemsPerPage,
    TotalItems: totalItems,
    TotalPages: Math.ceil(totalItems / itemsPerPage),
  };
}

/**
 * Create mock result counter response
 */
export function createMockResultCounter(overrides: Partial<{
  Total: number;
  New: number;
  Pathological: number;
  HighPathological: number;
  Urgent: number;
}> = {}) {
  return {
    Total: 100,
    New: 5,
    Pathological: 12,
    HighPathological: 3,
    Urgent: 1,
    ...overrides,
  };
}

/**
 * Create mock test result data (for trend charts)
 */
export function createMockTestResultData(testIdent: string, count: number = 5) {
  const baseDate = new Date();

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (count - i - 1) * 7); // Weekly intervals

    return {
      date: date.toLocaleDateString('de-DE'),
      dateRaw: date.toISOString(),
      value: 10 + Math.random() * 10, // Random value between 10-20
      resultId: i + 1,
      labNo: `LAB-${(i + 1).toString().padStart(6, '0')}`,
    };
  });
}
