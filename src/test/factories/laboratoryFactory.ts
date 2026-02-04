import { faker } from '@faker-js/faker';
import type { Laboratory, LaboratoryAddress, LaboratoryContact } from '../../api/types';

export const createMockLaboratoryAddress = (
  overrides?: Partial<LaboratoryAddress>
): LaboratoryAddress => {
  return {
    Street: faker.location.street(),
    HouseNumber: faker.location.buildingNumber(),
    Zip: faker.location.zipCode(),
    City: faker.location.city(),
    CountryCode: 'DE',
    ...overrides,
  };
};

export const createMockLaboratoryContact = (
  overrides?: Partial<LaboratoryContact>
): LaboratoryContact => {
  return {
    name: faker.person.fullName(),
    position: faker.helpers.arrayElement(['Lab Manager', 'Director', 'Technician']),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    ...overrides,
  };
};

export const createMockLaboratory = (overrides?: Partial<Laboratory>): Laboratory => {
  return {
    Id: faker.number.int({ min: 1, max: 999 }),
    Name: `${faker.company.name()} Laboratory`,
    Address: createMockLaboratoryAddress(),
    Phone: faker.phone.number(),
    Email: faker.internet.email(),
    Website: faker.internet.url(),
    Contacts: [createMockLaboratoryContact()],
    ...overrides,
  };
};

export const createMockLaboratories = (count: number = 3): Laboratory[] => {
  return Array.from({ length: count }, () => createMockLaboratory());
};
