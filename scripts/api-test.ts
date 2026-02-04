/**
 * API Test Script for labGate Demo Server
 *
 * This script authenticates with the labGate demo API and can:
 * - Query results (Befunde)
 * - Create orders (Aufträge)
 * - Push test data for development
 *
 * Usage:
 *   npx tsx scripts/api-test.ts
 *
 * Or with specific commands:
 *   npx tsx scripts/api-test.ts --fetch-results
 *   npx tsx scripts/api-test.ts --create-order
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Configuration
const API_BASE_URL = process.env.API_URL || 'https://demo.labgate.net';
const USERNAME = process.env.TEST_USERNAME || '';
const PASSWORD = process.env.TEST_PASSWORD || '';

// Types based on API documentation
interface LoginRequest {
  Username: string;
  Password: string;
}

interface LoginResponse {
  Token: string;
  PasswordExpired: boolean;
  RequiresSecondFactor: boolean;
  TwoFactorRegistrationIncomplete: boolean;
  Fullname: string;
  Firstname?: string;
  Lastname?: string;
  Email?: string;
}

interface LabResult {
  Id: number;
  LabNo: string;
  Patient: {
    Id: number;
    Fullname?: string;
    Firstname?: string;
    Lastname?: string;
    PatientNumber?: string;
    DateOfBirth?: string;
  };
  Sender?: {
    Id: number;
    Name: string;
    CustomerNo?: string;
  };
  Laboratory?: {
    Id: number;
    Name: string;
  };
  ReportDate: string;
  OrderDate?: string;
  Status?: string;
  ResultType?: string;
  IsRead: boolean;
  IsFavorite: boolean;
  IsArchived: boolean;
  IsPathological?: boolean;
  IsUrgent?: boolean;
}

interface PaginatedResponse<T> {
  Results: T[];
  TotalCount: number;
  CurrentPage: number;
  ItemsPerPage: number;
  TotalPages: number;
}

interface ResultCounter {
  TotalCount: number;
  NonReadCount: number;
  PathologicalCount: number;
  HighPathologicalCount: number;
  UrgentCount: number;
}

// Order types based on SaveOrder schema
interface OrderPatient {
  Id?: number;
  Firstname: string;
  Lastname: string;
  DateOfBirth?: string;
  Gender?: 'Male' | 'Female' | 'Unknown';
  PatientNumber?: string;
  InsuranceNumber?: string;
}

interface SaveOrder {
  Id: number;
  CurrentStatus: string;
  OrderUsesManualHzvCheck: boolean;
  TypeOfAccount: string;
  KindOfInsurance: string;
  PrivateTariff: string;
  DmpIdentifier: string;
  IsEmergency: boolean;
  IsHurried: boolean;
  TypeOfTreatment: string;
  IsTransferred: boolean;
  IsAccident: boolean;
  IsInfection: boolean;
  IsSgb116b: boolean;
  IsSgb16: boolean;
  AlternateProcedure: string;
  MethodOfExamination: string;
  AdditionalLabelsCount: number;
  UsesComplexServices: boolean;
  Patient?: OrderPatient;
  SelectedRequests?: Array<{ Id: number; Name?: string }>;
}

class LabGateApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    console.log(`\n🔐 Authenticating as ${username}...`);

    const response = await this.client.post<LoginResponse>(
      '/Api/V2/Authentication/Authorize',
      { Username: username, Password: password } as LoginRequest
    );

    this.token = response.data.Token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

    console.log(`✅ Logged in as ${response.data.Fullname}`);
    if (response.data.RequiresSecondFactor) {
      console.log('⚠️  Two-factor authentication required');
    }

    return response.data;
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.post('/Api/V2/Authentication/Ping', { Token: this.token });
      console.log('✅ Token is valid');
      return true;
    } catch {
      console.log('❌ Token is invalid or expired');
      return false;
    }
  }

  async getResults(params?: {
    CurrentPage?: number;
    ItemsPerPage?: number;
    Query?: string;
    ResultCategory?: 'None' | 'New' | 'Pathological' | 'Urgent';
    Area?: 'NotArchived' | 'Archived' | 'All';
  }): Promise<PaginatedResponse<LabResult>> {
    console.log('\n📋 Fetching results...');

    const response = await this.client.get<PaginatedResponse<LabResult>>('/api/v3/results', {
      params: {
        CurrentPage: params?.CurrentPage || 1,
        ItemsPerPage: params?.ItemsPerPage || 25,
        ...params,
      },
    });

    console.log(`✅ Found ${response.data.TotalCount} results (page ${response.data.CurrentPage}/${response.data.TotalPages})`);
    return response.data;
  }

  async getResultById(id: number): Promise<LabResult> {
    console.log(`\n📄 Fetching result #${id}...`);

    const response = await this.client.get<{ Result: LabResult }>(`/api/v3/results/${id}`);

    console.log(`✅ Retrieved result: ${response.data.Result.LabNo}`);
    return response.data.Result;
  }

  async getResultCounter(): Promise<ResultCounter> {
    console.log('\n📊 Fetching result counters...');

    const response = await this.client.get<ResultCounter>('/api/v3/results/counter');

    console.log(`✅ Counters: Total=${response.data.TotalCount}, New=${response.data.NonReadCount}, Pathological=${response.data.PathologicalCount}, Urgent=${response.data.UrgentCount}`);
    return response.data;
  }

  async markResultsAsRead(ids: number[]): Promise<void> {
    console.log(`\n✓ Marking ${ids.length} results as read...`);

    await this.client.patch('/api/v3/results/mark-as-read', { Ids: ids });

    console.log('✅ Results marked as read');
  }

  async markResultsAsUnread(ids: number[]): Promise<void> {
    console.log(`\n○ Marking ${ids.length} results as unread...`);

    await this.client.patch('/api/v3/results/mark-as-unread', { Ids: ids });

    console.log('✅ Results marked as unread');
  }

  async getPatients(params?: {
    CurrentPage?: number;
    ItemsPerPage?: number;
    Query?: string;
  }): Promise<PaginatedResponse<{ Id: number; Fullname: string }>> {
    console.log('\n👥 Fetching patients...');

    const response = await this.client.get('/api/v3/patients', {
      params: {
        CurrentPage: params?.CurrentPage || 1,
        ItemsPerPage: params?.ItemsPerPage || 25,
        ...params,
      },
    });

    console.log(`✅ Found ${response.data.TotalCount} patients`);
    return response.data;
  }

  async getLaboratories(): Promise<PaginatedResponse<{ Id: number; Name: string }>> {
    console.log('\n🏥 Fetching laboratories...');

    const response = await this.client.get('/api/v3/laboratories');

    console.log(`✅ Found ${response.data.TotalCount} laboratories`);
    return response.data;
  }

  async saveOrder(order: SaveOrder, clientId: number): Promise<unknown> {
    console.log(`\n📝 Saving order...`);

    const response = await this.client.patch('/api/v3/orders/save', order, {
      params: { clientId },
    });

    console.log('✅ Order saved');
    return response.data;
  }

  async approveOrder(orderId: number): Promise<unknown> {
    console.log(`\n✓ Approving order #${orderId}...`);

    const response = await this.client.post('/api/v3/orders/approve', null, {
      params: { orderId },
    });

    console.log('✅ Order approved');
    return response.data;
  }

  async getOrderForms(clientId: number): Promise<unknown> {
    console.log(`\n📋 Fetching order forms for client ${clientId}...`);

    const response = await this.client.get(`/api/v3/orders/client/${clientId}/forms`);

    console.log('✅ Order forms retrieved');
    return response.data;
  }

  async logout(): Promise<void> {
    console.log('\n👋 Logging out...');

    await this.client.post('/Api/V2/Authentication/Logout', { Token: this.token });
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];

    console.log('✅ Logged out');
  }
}

// Helper function to create sample order data
function createSampleOrder(id: number = 0): SaveOrder {
  return {
    Id: id,
    CurrentStatus: 'New',
    OrderUsesManualHzvCheck: false,
    TypeOfAccount: 'HealthInsurance',
    KindOfInsurance: 'GKV',
    PrivateTariff: '',
    DmpIdentifier: '',
    IsEmergency: false,
    IsHurried: false,
    TypeOfTreatment: 'Ambulatory',
    IsTransferred: false,
    IsAccident: false,
    IsInfection: false,
    IsSgb116b: false,
    IsSgb16: false,
    AlternateProcedure: '',
    MethodOfExamination: '',
    AdditionalLabelsCount: 0,
    UsesComplexServices: false,
    Patient: {
      Firstname: 'Test',
      Lastname: 'Patient',
      DateOfBirth: '1990-01-15',
      Gender: 'Unknown',
      PatientNumber: `TEST${Date.now()}`,
    },
    SelectedRequests: [],
  };
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || '--all';

  if (!USERNAME || !PASSWORD) {
    console.error('❌ Error: TEST_USERNAME and TEST_PASSWORD environment variables are required');
    console.log('\nUsage:');
    console.log('  TEST_USERNAME=user TEST_PASSWORD=pass npx tsx scripts/api-test.ts');
    console.log('\nOr set them in your .env file.');
    process.exit(1);
  }

  const client = new LabGateApiClient(API_BASE_URL);

  try {
    // Login
    await client.login(USERNAME, PASSWORD);

    switch (command) {
      case '--fetch-results':
        await client.getResultCounter();
        const results = await client.getResults({ ItemsPerPage: 10 });
        if (results.Results.length > 0) {
          console.log('\n📋 Sample results:');
          results.Results.slice(0, 5).forEach((r) => {
            console.log(`  - ${r.LabNo}: ${r.Patient.Fullname} (${r.ReportDate})`);
          });
        }
        break;

      case '--create-order':
        console.log('\n⚠️  Note: Creating orders requires valid clientId and laboratory setup');
        const order = createSampleOrder();
        console.log('\nSample order structure:');
        console.log(JSON.stringify(order, null, 2));
        break;

      case '--all':
      default:
        // Full test flow
        console.log('\n' + '='.repeat(50));
        console.log('Running full API test...');
        console.log('='.repeat(50));

        // Test token validity
        await client.ping();

        // Fetch counters
        await client.getResultCounter();

        // Fetch results
        const allResults = await client.getResults({ ItemsPerPage: 10 });
        if (allResults.Results.length > 0) {
          console.log('\n📋 First 5 results:');
          allResults.Results.slice(0, 5).forEach((r) => {
            console.log(`  - ${r.LabNo}: ${r.Patient.Fullname || 'Unknown'} (${r.ReportDate})`);
          });

          // Get details of first result
          const firstResult = await client.getResultById(allResults.Results[0].Id);
          console.log('\n📄 Result details:');
          console.log(JSON.stringify(firstResult, null, 2).slice(0, 500) + '...');
        }

        // Fetch patients
        await client.getPatients({ ItemsPerPage: 5 });

        // Fetch laboratories
        await client.getLaboratories();

        console.log('\n' + '='.repeat(50));
        console.log('✅ API test completed successfully!');
        console.log('='.repeat(50));
        break;
    }

    // Logout
    await client.logout();
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('\n❌ API Error:', axiosError.message);
    if (axiosError.response) {
      console.error('Status:', axiosError.response.status);
      console.error('Data:', axiosError.response.data);
    }
    process.exit(1);
  }
}

main();
