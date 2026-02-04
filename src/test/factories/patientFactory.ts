import { faker } from '@faker-js/faker';
import type { Patient, GenderType, AccountType } from '../../api/types';

export const createMockPatient = (overrides?: Partial<Patient>): Patient => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    Id: faker.number.int({ min: 1, max: 999999 }),
    Firstname: firstName,
    Lastname: lastName,
    DateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toISOString().split('T')[0],
    Gender: faker.helpers.arrayElement<GenderType>(['Male', 'Female', 'Diverse', 'Unknown']),
    Age: faker.number.int({ min: 18, max: 90 }),
    AccountType: 'PrivatePatient' as AccountType,
    PatientNumber: faker.string.numeric(8),
    Email: faker.internet.email(),
    PhoneNumber: faker.phone.number(),
    InsurantIdent: faker.string.alphanumeric(10),
    InsuranceIdent: faker.string.numeric(10),
    Address: {
      Street: faker.location.streetAddress(),
      HouseNumber: faker.location.buildingNumber(),
      Zip: faker.location.zipCode(),
      City: faker.location.city(),
      CountryCode: 'DE',
    },
    CreatedOn: faker.date.past().toISOString(),
    ModifiedOn: faker.date.recent().toISOString(),
    ResultCount: faker.number.int({ min: 0, max: 50 }),
    LastResultDate: faker.date.recent().toISOString(),
    HasPatho: faker.datatype.boolean(),
    ...overrides,
  };
};

export const createMockPatients = (count: number = 5): Patient[] => {
  return Array.from({ length: count }, () => createMockPatient());
};
