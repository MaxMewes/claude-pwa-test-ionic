import { faker } from '@faker-js/faker';
import type { User, Permission, UserRole } from '../../api/types';

export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'doctor' as UserRole,
    permissions: ['view_results', 'view_patients'] as Permission[],
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
};

export const createMockAdmin = (overrides?: Partial<User>): User => {
  return createMockUser({
    role: 'admin',
    permissions: [
      'view_results',
      'view_patients',
      'manage_patients',
      'view_laboratories',
      'manage_laboratories',
      'view_news',
      'manage_news',
      'manage_settings',
    ] as Permission[],
    ...overrides,
  });
};

export const createMockPatientUser = (overrides?: Partial<User>): User => {
  return createMockUser({
    role: 'patient',
    permissions: ['view_results'] as Permission[],
    ...overrides,
  });
};
