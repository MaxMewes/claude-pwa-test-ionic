import { faker } from '@faker-js/faker';
import type {
  LabResult,
  ResultPatient,
  ResultSender,
  ResultLaboratory,
  TestResult,
} from '../../api/types';

export const createMockResultPatient = (overrides?: Partial<ResultPatient>): ResultPatient => {
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  
  return {
    Id: faker.number.int({ min: 1, max: 999999 }),
    Firstname: firstname,
    Lastname: lastname,
    Fullname: `${firstname} ${lastname}`,
    PatientNumber: faker.string.numeric(8),
    DateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toISOString().split('T')[0],
    ...overrides,
  };
};

export const createMockResultSender = (overrides?: Partial<ResultSender>): ResultSender => {
  return {
    Id: faker.number.int({ min: 1, max: 999 }),
    Name: `Dr. ${faker.person.lastName()}`,
    CustomerNo: faker.string.numeric(6),
    ...overrides,
  };
};

export const createMockResultLaboratory = (
  overrides?: Partial<ResultLaboratory>
): ResultLaboratory => {
  return {
    Id: faker.number.int({ min: 1, max: 999 }),
    Name: `${faker.company.name()} Laboratory`,
    ...overrides,
  };
};

export const createMockTestResult = (overrides?: Partial<TestResult>): TestResult => {
  const isPathological = faker.datatype.boolean({ probability: 0.3 });
  const value = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
  
  return {
    Id: faker.number.int({ min: 1, max: 99999 }),
    TestIdent: faker.string.alphanumeric(5).toUpperCase(),
    TestName: faker.helpers.arrayElement([
      'Hemoglobin',
      'White Blood Cells',
      'Platelets',
      'Glucose',
      'Cholesterol',
      'Creatinine',
      'Sodium',
      'Potassium',
    ]),
    Value: value.toString(),
    Unit: faker.helpers.arrayElement(['g/dL', 'K/uL', 'mg/dL', 'mmol/L', 'U/L']),
    ReferenceRange: '12.0 - 16.0',
    ReferenceMin: 12.0,
    ReferenceMax: 16.0,
    IsPathological: isPathological,
    PathologyIndicator: isPathological
      ? faker.helpers.arrayElement(['L', 'H', 'LL', 'HH'])
      : undefined,
    ...overrides,
  };
};

export const createMockLabResult = (overrides?: Partial<LabResult>): LabResult => {
  const hasPathological = faker.datatype.boolean({ probability: 0.3 });
  const isUrgent = faker.datatype.boolean({ probability: 0.1 });
  const reportDate = faker.date.recent({ days: 30 });
  
  return {
    Id: faker.number.int({ min: 1, max: 999999 }),
    LabNo: `LAB${faker.string.numeric(6)}`,
    Patient: createMockResultPatient(),
    Sender: createMockResultSender(),
    Laboratory: createMockResultLaboratory(),
    ReportDate: reportDate.toISOString(),
    OrderDate: faker.date.recent({ days: 35 }).toISOString(),
    Status: faker.helpers.arrayElement(['pending', 'partial', 'final', 'corrected']),
    ResultType: faker.helpers.arrayElement(['E', 'T', 'V', 'N', 'A']),
    LaboratorySection: faker.helpers.arrayElement([
      'Hematology',
      'Chemistry',
      'Immunology',
      'Microbiology',
    ]),
    IsFavorite: faker.datatype.boolean({ probability: 0.2 }),
    IsRead: faker.datatype.boolean({ probability: 0.7 }),
    IsArchived: faker.datatype.boolean({ probability: 0.1 }),
    IsPathological: hasPathological,
    IsPatho: hasPathological,
    IsHighPatho: hasPathological && faker.datatype.boolean({ probability: 0.3 }),
    IsUrgent: isUrgent,
    IsEmergency: isUrgent,
    HasCriticalValues: faker.datatype.boolean({ probability: 0.1 }),
    HasDocuments: faker.datatype.boolean({ probability: 0.5 }),
    IsConfirmable: faker.datatype.boolean({ probability: 0.3 }),
    ResultData: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () =>
      createMockTestResult()
    ),
    ...overrides,
  };
};

export const createMockLabResults = (count: number = 10): LabResult[] => {
  return Array.from({ length: count }, () => createMockLabResult());
};

export const createMockPathologicalResult = (overrides?: Partial<LabResult>): LabResult => {
  return createMockLabResult({
    IsPathological: true,
    IsPatho: true,
    IsRead: false,
    ResultData: [
      createMockTestResult({
        IsPathological: true,
        PathologyIndicator: 'H',
        Value: '18.5',
        ReferenceMax: 16.0,
      }),
    ],
    ...overrides,
  });
};

export const createMockUrgentResult = (overrides?: Partial<LabResult>): LabResult => {
  return createMockLabResult({
    IsUrgent: true,
    IsEmergency: true,
    IsRead: false,
    HasCriticalValues: true,
    ResultData: [
      createMockTestResult({
        IsPathological: true,
        PathologyIndicator: 'HH',
        Value: '25.0',
        ReferenceMax: 16.0,
      }),
    ],
    ...overrides,
  });
};
