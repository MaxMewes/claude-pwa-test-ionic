/**
 * MSW Request Handlers for API Mocking
 *
 * Complete API mock coverage for testing.
 * These handlers intercept network requests during tests and return mock responses.
 */

import { http, HttpResponse, delay } from 'msw';
import {
  createMockLabResult,
  createMockPatient,
  createMockResultPatient,
  createMockResultCounter,
} from '../factories';

// Base URL for API requests (empty for relative URLs in tests)
const API_BASE = '';

// Helper to simulate network delay in tests
const SIMULATE_DELAY = false;
const simulateDelay = async () => {
  if (SIMULATE_DELAY) await delay(100);
};

// ============================================================================
// Authentication Handlers
// ============================================================================

const authHandlers = [
  // V2 Authentication - Login
  http.post(`${API_BASE}/Api/V2/Authentication/Authorize`, async ({ request }) => {
    await simulateDelay();
    const body = (await request.json()) as { Username: string; Password: string };

    // Simulate invalid credentials
    if (body.Password === 'wrong' || body.Password === 'invalid') {
      return HttpResponse.json(
        { Message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Simulate 2FA required
    if (body.Username === '2fa@test.com') {
      return HttpResponse.json({
        Token: '',
        TempToken: 'temp-token-for-2fa',
        RequiresSecondFactor: true,
        PasswordExpired: false,
      });
    }

    // Simulate expired password
    if (body.Username === 'expired@test.com') {
      return HttpResponse.json({
        Token: 'mock-token-expired-pw',
        RequiresSecondFactor: false,
        PasswordExpired: true,
        Email: body.Username,
        FullName: 'Expired User',
      });
    }

    // Successful login
    return HttpResponse.json({
      Token: 'mock-jwt-token-12345',
      RequiresSecondFactor: false,
      PasswordExpired: false,
      Email: body.Username,
      FullName: 'Test User',
      FirstName: 'Test',
      LastName: 'User',
    });
  }),

  // V2 Authentication - Verify 2FA
  http.post(`${API_BASE}/Api/V2/Authentication/Verify2FALogin`, async ({ request }) => {
    await simulateDelay();
    const body = (await request.json()) as { TempToken: string; Code: string };

    // Simulate invalid code
    if (body.Code === '000000') {
      return HttpResponse.json(
        { Message: 'Invalid verification code' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      Token: 'mock-jwt-token-after-2fa',
      Email: '2fa@test.com',
      FullName: '2FA User',
      FirstName: '2FA',
      LastName: 'User',
    });
  }),

  // V2 Authentication - Change Password
  http.post(`${API_BASE}/Api/V2/Authentication/ChangePassword`, async ({ request }) => {
    await simulateDelay();
    const body = (await request.json()) as { OldPassword: string; NewPassword: string };

    if (body.OldPassword === 'wrong') {
      return HttpResponse.json(
        { Message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Logout
  http.post(`${API_BASE}/authentication/logout`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Register (legacy)
  http.post(`${API_BASE}/authentication/register`, async () => {
    await simulateDelay();
    return HttpResponse.json({
      Message: 'Registration successful',
    });
  }),

  // Reset Password (legacy)
  http.post(`${API_BASE}/authentication/reset-password`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Password Rules
  http.get(`${API_BASE}/authentication/passwords/rules`, async () => {
    await simulateDelay();
    return HttpResponse.json({
      MinLength: 8,
      RequireDigit: true,
      RequireLowercase: true,
      RequireUppercase: true,
      RequireNonAlphanumeric: true,
    });
  }),

  // V3 Authentication - Register
  http.post(`${API_BASE}/api/v3/authentication/register`, async () => {
    await simulateDelay();
    return HttpResponse.json({
      Message: 'Registration successful',
    });
  }),

  // V3 Authentication - Reset Password
  http.post(`${API_BASE}/api/v3/authentication/reset-password`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // V3 Authentication - Token Refresh
  http.post(`${API_BASE}/api/v3/authentication/refresh`, async () => {
    await simulateDelay();
    return HttpResponse.json({
      Token: 'mock-refreshed-jwt-token',
    });
  }),
];

// ============================================================================
// Results Handlers
// ============================================================================

const resultsHandlers = [
  // Get paginated results
  http.get(`${API_BASE}/api/v3/results`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('Page') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '25');
    const area = url.searchParams.get('Area');
    const category = url.searchParams.get('ResultCategory');

    // Generate results based on query
    let results = Array.from({ length: itemsPerPage }, (_, i) =>
      createMockLabResult({ Id: (page - 1) * itemsPerPage + i + 1 })
    );

    // Modify results based on filters
    if (category === 'Pathological') {
      results = results.map((r) => ({ ...r, IsPatho: true }));
    } else if (category === 'Urgent') {
      results = results.map((r) => ({ ...r, IsEmergency: true, IsHighPatho: true }));
    } else if (category === 'New') {
      results = results.map((r) => ({ ...r, IsRead: false }));
    }

    if (area === 'Archived') {
      results = results.map((r) => ({ ...r, IsArchived: true }));
    }

    return HttpResponse.json({
      Results: results,
      Page: page,
      ItemsPerPage: itemsPerPage,
      TotalItems: 100,
      TotalPages: Math.ceil(100 / itemsPerPage),
    });
  }),

  // Get single result detail
  http.get(`${API_BASE}/api/v3/results/:id`, async ({ params }) => {
    await simulateDelay();
    const id = parseInt(params.id as string);

    return HttpResponse.json({
      Result: {
        Id: id,
        LabNo: `LAB-${id.toString().padStart(6, '0')}`,
        ReportDate: new Date().toISOString(),
        CollectionDate: new Date(Date.now() - 86400000).toISOString(),
        Patient: createMockResultPatient({ Id: 1 }),
        Sender: { Id: 1, Name: 'Labor Berlin' },
        IsRead: true,
        IsPatho: false,
        IsHighPatho: false,
        IsEmergency: false,
        IsFavorite: false,
        IsArchived: false,
        ResultData: {
          'Blutbild': [
            {
              Id: 1,
              TestIdent: 'HB',
              TestName: 'Hämoglobin',
              Value: 14.5,
              ValueText: '14.5',
              Unit: 'g/dL',
              NormalLow: 12.0,
              NormalHigh: 16.0,
              NormalText: '12.0 - 16.0',
              PathoFlag: null,
            },
            {
              Id: 2,
              TestIdent: 'WBC',
              TestName: 'Leukozyten',
              Value: 7.2,
              ValueText: '7.2',
              Unit: '10^9/L',
              NormalLow: 4.0,
              NormalHigh: 10.0,
              NormalText: '4.0 - 10.0',
              PathoFlag: null,
            },
            {
              Id: 3,
              TestIdent: 'RBC',
              TestName: 'Erythrozyten',
              Value: 4.8,
              ValueText: '4.8',
              Unit: '10^12/L',
              NormalLow: 4.0,
              NormalHigh: 5.5,
              NormalText: '4.0 - 5.5',
              PathoFlag: null,
            },
            {
              Id: 4,
              TestIdent: 'PLT',
              TestName: 'Thrombozyten',
              Value: 250,
              ValueText: '250',
              Unit: '10^9/L',
              NormalLow: 150,
              NormalHigh: 400,
              NormalText: '150 - 400',
              PathoFlag: null,
            },
          ],
          'Klinische Chemie': [
            {
              Id: 5,
              TestIdent: 'GLU',
              TestName: 'Glucose',
              Value: 95,
              ValueText: '95',
              Unit: 'mg/dL',
              NormalLow: 70,
              NormalHigh: 100,
              NormalText: '70 - 100',
              PathoFlag: null,
            },
            {
              Id: 6,
              TestIdent: 'CREA',
              TestName: 'Kreatinin',
              Value: 1.1,
              ValueText: '1.1',
              Unit: 'mg/dL',
              NormalLow: 0.7,
              NormalHigh: 1.2,
              NormalText: '0.7 - 1.2',
              PathoFlag: null,
            },
          ],
        },
      },
    });
  }),

  // Get results counter
  http.get(`${API_BASE}/api/v3/results/counter`, async () => {
    await simulateDelay();
    return HttpResponse.json(createMockResultCounter());
  }),

  // Alias for counter endpoint
  http.get(`${API_BASE}/api/v3/results/count`, async () => {
    await simulateDelay();
    return HttpResponse.json(createMockResultCounter());
  }),

  // Mark results as read
  http.patch(`${API_BASE}/api/v3/results/mark-as-read`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Mark results as unread
  http.patch(`${API_BASE}/api/v3/results/mark-as-unread`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Mark results as favorite
  http.patch(`${API_BASE}/api/v3/results/mark-as-favorite`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Mark results as not favorite
  http.patch(`${API_BASE}/api/v3/results/mark-as-not-favorite`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Mark results as archived
  http.patch(`${API_BASE}/api/v3/results/mark-as-archived`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Mark results as not archived
  http.patch(`${API_BASE}/api/v3/results/mark-as-not-archived`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Pin result
  http.patch(`${API_BASE}/api/v3/results/:resultId/pin`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  // Legacy POST endpoint for marking as read
  http.post(`${API_BASE}/api/v3/results/read`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),
];

// ============================================================================
// Patients Handlers
// ============================================================================

const patientsHandlers = [
  // Get paginated patients
  http.get(`${API_BASE}/api/v3/patients`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('Page') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '20');
    const search = url.searchParams.get('Search') || '';

    let patients = Array.from({ length: itemsPerPage }, (_, i) =>
      createMockPatient({ Id: (page - 1) * itemsPerPage + i + 1 })
    );

    // Filter by search if provided
    if (search) {
      patients = patients.filter(
        (p) =>
          p.Firstname?.toLowerCase().includes(search.toLowerCase()) ||
          p.Lastname?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json({
      Patients: patients,
      Page: page,
      ItemsPerPage: itemsPerPage,
      TotalItems: 50,
      TotalPages: Math.ceil(50 / itemsPerPage),
    });
  }),

  // Get single patient
  http.get(`${API_BASE}/api/v3/patients/:id`, async ({ params }) => {
    await simulateDelay();
    const id = parseInt(params.id as string);
    return HttpResponse.json({
      Patient: {
        ...createMockPatient({ Id: id }),
        Phone: '+49 30 12345678',
        Email: `patient${id}@example.com`,
        Addresses: [
          {
            Street: 'Musterstraße',
            HouseNumber: '42',
            Zip: '10115',
            City: 'Berlin',
            CountryCode: 'DE',
          },
        ],
      },
    });
  }),

  // Get patient results
  http.get(`${API_BASE}/api/v3/patients/:id/results`, async ({ params }) => {
    await simulateDelay();
    const patientId = parseInt(params.id as string);
    const results = Array.from({ length: 10 }, (_, i) =>
      createMockLabResult({
        Id: i + 1,
        Patient: createMockResultPatient({ Id: patientId }),
      })
    );

    return HttpResponse.json({
      Results: results,
    });
  }),
];

// ============================================================================
// News Handlers
// ============================================================================

const newsHandlers = [
  // Get paginated news
  http.get(`${API_BASE}/api/v3/news`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('Page') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '10');
    const category = url.searchParams.get('Category');

    const newsItems = Array.from({ length: itemsPerPage }, (_, i) => ({
      Id: (page - 1) * itemsPerPage + i + 1,
      Title: `Neuigkeit ${(page - 1) * itemsPerPage + i + 1}`,
      Summary: 'Dies ist eine Zusammenfassung der Neuigkeit...',
      Category: category || 'General',
      PublishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      IsRead: i > 2,
    }));

    return HttpResponse.json({
      News: newsItems,
      Page: page,
      ItemsPerPage: itemsPerPage,
      TotalItems: 25,
      TotalPages: Math.ceil(25 / itemsPerPage),
    });
  }),

  // Get single news article
  http.get(`${API_BASE}/api/v3/news/:id`, async ({ params }) => {
    await simulateDelay();
    const id = parseInt(params.id as string);

    return HttpResponse.json({
      News: {
        Id: id,
        Title: `Neuigkeit ${id}`,
        Summary: 'Dies ist eine Zusammenfassung der Neuigkeit...',
        Content: `<p>Dies ist der vollständige Inhalt der Neuigkeit ${id}.</p><p>Mit {color:#dc9656}farbigem Text{color} und weiteren Details.</p>`,
        Category: 'General',
        PublishedAt: new Date().toISOString(),
        IsRead: false,
      },
    });
  }),

  // Mark news as read
  http.patch(`${API_BASE}/api/v3/news/:newsId/read`, async () => {
    await simulateDelay();
    return new HttpResponse(null, { status: 204 });
  }),
];

// ============================================================================
// Senders Handlers
// ============================================================================

const sendersHandlers = [
  // Get paginated senders
  http.get(`${API_BASE}/api/v3/senders`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('Page') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '20');

    const senders = [
      { Id: 1, Name: 'Dr. Müller Praxis', Street: 'Hauptstraße 1', City: 'Berlin', Zip: '10115' },
      { Id: 2, Name: 'Klinikum Brandenburg', Street: 'Carl-Reichstein-Straße 11', City: 'Brandenburg', Zip: '14770' },
      { Id: 3, Name: 'Hausarztpraxis Schmidt', Street: 'Nebenstraße 5', City: 'München', Zip: '80331' },
      { Id: 4, Name: 'MVZ Labordiagnostik', Street: 'Laborweg 10', City: 'Hamburg', Zip: '20095' },
    ];

    return HttpResponse.json({
      Senders: senders,
      Page: page,
      ItemsPerPage: itemsPerPage,
      TotalItems: senders.length,
      TotalPages: 1,
    });
  }),

  // Get single sender
  http.get(`${API_BASE}/api/v3/senders/:id`, async ({ params }) => {
    await simulateDelay();
    const id = parseInt(params.id as string);

    return HttpResponse.json({
      Sender: {
        Id: id,
        Name: `Einsender ${id}`,
        Street: 'Musterstraße 42',
        City: 'Berlin',
        Zip: '10115',
        Phone: '+49 30 12345678',
        Email: `sender${id}@example.com`,
      },
    });
  }),
];

// ============================================================================
// Laboratories Handlers
// ============================================================================

const laboratoriesHandlers = [
  // Get paginated laboratories
  http.get(`${API_BASE}/api/v3/laboratories`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('Page') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '20');

    const laboratories = [
      {
        Id: 1,
        Name: 'Labor Berlin',
        Address: 'Laborstraße 1, 10115 Berlin',
        Phone: '+49 30 12345678',
        Email: 'info@labor-berlin.de',
      },
      {
        Id: 2,
        Name: 'MVZ Labor München',
        Address: 'Laborweg 5, 80331 München',
        Phone: '+49 89 87654321',
        Email: 'info@labor-muenchen.de',
      },
      {
        Id: 3,
        Name: 'Speziallabor Hamburg',
        Address: 'Hafenstraße 15, 20095 Hamburg',
        Phone: '+49 40 11223344',
        Email: 'info@labor-hamburg.de',
      },
    ];

    return HttpResponse.json({
      Laboratories: laboratories,
      Page: page,
      ItemsPerPage: itemsPerPage,
      TotalItems: laboratories.length,
      TotalPages: 1,
    });
  }),

  // Get single laboratory with contact persons
  http.get(`${API_BASE}/api/v3/laboratories/:id`, async ({ params }) => {
    await simulateDelay();
    const id = parseInt(params.id as string);

    return HttpResponse.json({
      Laboratory: {
        Id: id,
        Name: `Labor ${id}`,
        Address: 'Laborstraße 1, 10115 Berlin',
        Phone: '+49 30 12345678',
        Fax: '+49 30 12345679',
        Email: `info@labor${id}.de`,
        Website: `https://www.labor${id}.de`,
        OpeningHours: 'Mo-Fr 8:00-18:00, Sa 9:00-13:00',
        ContactPersons: [
          {
            Id: 1,
            Name: 'Dr. Max Mustermann',
            Role: 'Laborleiter',
            Phone: '+49 30 12345680',
            Email: 'mustermann@labor.de',
          },
          {
            Id: 2,
            Name: 'Maria Schmidt',
            Role: 'Ansprechpartner',
            Phone: '+49 30 12345681',
            Email: 'schmidt@labor.de',
          },
        ],
      },
    });
  }),

  // Get service catalog
  http.get(`${API_BASE}/api/v3/requests`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('Search') || '';

    const services = [
      { Id: 1, Name: 'Großes Blutbild', Category: 'Hämatologie', Code: 'BB01' },
      { Id: 2, Name: 'Kleines Blutbild', Category: 'Hämatologie', Code: 'BB02' },
      { Id: 3, Name: 'Glucose', Category: 'Klinische Chemie', Code: 'GLU01' },
      { Id: 4, Name: 'HbA1c', Category: 'Diabetologie', Code: 'HBA01' },
      { Id: 5, Name: 'Schilddrüsenprofil', Category: 'Endokrinologie', Code: 'SD01' },
    ].filter(
      (s) =>
        !search ||
        s.Name.toLowerCase().includes(search.toLowerCase()) ||
        s.Code.toLowerCase().includes(search.toLowerCase())
    );

    return HttpResponse.json({
      Services: services,
    });
  }),

  // Get service detail
  http.get(`${API_BASE}/api/v3/requests/:serviceId`, async ({ params }) => {
    await simulateDelay();
    const id = parseInt(params.serviceId as string);

    return HttpResponse.json({
      Service: {
        Id: id,
        Name: `Test ${id}`,
        Category: 'Hämatologie',
        Code: `T${id.toString().padStart(3, '0')}`,
        Description: 'Beschreibung des Labortests...',
        Materials: [
          { Id: 1, Name: 'EDTA-Blut', Volume: '2 ml', Container: 'Lila Monovette' },
          { Id: 2, Name: 'Serum', Volume: '5 ml', Container: 'Braune Monovette' },
        ],
        Tests: [
          { Id: 1, Name: 'Hämoglobin', Unit: 'g/dL', NormalRange: '12.0 - 16.0' },
          { Id: 2, Name: 'Hämatokrit', Unit: '%', NormalRange: '36 - 46' },
        ],
      },
    });
  }),
];

// ============================================================================
// Help/Support Handlers
// ============================================================================

const helpHandlers = [
  // Get FAQ items
  http.get(`${API_BASE}/api/v3/faq`, async ({ request }) => {
    await simulateDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('Page') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '20');

    const faqItems = [
      {
        Id: 1,
        Question: 'Wie lese ich meine Laborbefunde?',
        Answer: 'Ihre Laborbefunde enthalten verschiedene Werte, die im Vergleich zu Referenzbereichen dargestellt werden...',
        Category: 'Befunde',
      },
      {
        Id: 2,
        Question: 'Was bedeuten die farbigen Markierungen?',
        Answer: 'Farbige Markierungen zeigen abweichende Werte an. Rot bedeutet erhöht, blau bedeutet erniedrigt...',
        Category: 'Befunde',
      },
      {
        Id: 3,
        Question: 'Wie kann ich meinen Arzt kontaktieren?',
        Answer: 'Über die App können Sie direkt Kontakt zu Ihrem behandelnden Arzt aufnehmen...',
        Category: 'Kontakt',
      },
      {
        Id: 4,
        Question: 'Wie ändere ich mein Passwort?',
        Answer: 'Gehen Sie zu Einstellungen > Sicherheit > Passwort ändern...',
        Category: 'Account',
      },
      {
        Id: 5,
        Question: 'Sind meine Daten sicher?',
        Answer: 'Ja, alle Daten werden verschlüsselt übertragen und gespeichert...',
        Category: 'Sicherheit',
      },
    ];

    return HttpResponse.json({
      Items: faqItems,
      Page: page,
      ItemsPerPage: itemsPerPage,
      TotalItems: faqItems.length,
      TotalPages: 1,
    });
  }),

  // Get app update info
  http.get(`${API_BASE}/api/v3/mobile-apps/update-info`, async () => {
    await simulateDelay();
    return HttpResponse.json({
      CurrentVersion: '1.0.0',
      LatestVersion: '1.0.0',
      UpdateAvailable: false,
      MandatoryUpdate: false,
      ReleaseNotes: '',
      DownloadUrl: '',
    });
  }),

  // Legacy app update info endpoint
  http.get(`${API_BASE}/api/v3/app/update-info`, async () => {
    await simulateDelay();
    return HttpResponse.json({
      CurrentVersion: '1.0.0',
      LatestVersion: '1.0.0',
      UpdateAvailable: false,
      MandatoryUpdate: false,
    });
  }),

  // Submit feedback
  http.post(`${API_BASE}/feedbacks`, async ({ request }) => {
    await simulateDelay();
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      Id: 1,
      Message: 'Feedback received',
      ...body,
    }, { status: 201 });
  }),
];

// ============================================================================
// Combined Handlers Export
// ============================================================================

export const handlers = [
  ...authHandlers,
  ...resultsHandlers,
  ...patientsHandlers,
  ...newsHandlers,
  ...sendersHandlers,
  ...laboratoriesHandlers,
  ...helpHandlers,
];

// ============================================================================
// Error Simulation Handlers
// ============================================================================

/**
 * Error handlers for testing error scenarios.
 * Use server.use(errorHandlers.networkError) in tests to simulate errors.
 */
export const errorHandlers = {
  // Network error (connection refused, timeout, etc.)
  networkError: http.all('*', () => {
    return HttpResponse.error();
  }),

  // Server error (500)
  serverError: http.all('*', () => {
    return HttpResponse.json(
      { Message: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  // Unauthorized (401)
  unauthorized: http.all('*', () => {
    return HttpResponse.json(
      { Message: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // Forbidden (403)
  forbidden: http.all('*', () => {
    return HttpResponse.json(
      { Message: 'Forbidden' },
      { status: 403 }
    );
  }),

  // Not Found (404)
  notFound: http.all('*', () => {
    return HttpResponse.json(
      { Message: 'Not Found' },
      { status: 404 }
    );
  }),

  // Rate Limited (429)
  rateLimited: http.all('*', () => {
    return HttpResponse.json(
      { Message: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),

  // Slow response (for timeout testing)
  slowResponse: http.all('*', async () => {
    await delay(10000); // 10 second delay
    return HttpResponse.json({ Message: 'Slow response' });
  }),
};

/**
 * Specific endpoint error handlers.
 * Use these to simulate errors on specific endpoints.
 */
export const specificErrorHandlers = {
  // Results fetch fails
  resultsError: http.get(`${API_BASE}/api/v3/results`, () => {
    return HttpResponse.json(
      { Message: 'Failed to load results' },
      { status: 500 }
    );
  }),

  // Single result not found
  resultNotFound: http.get(`${API_BASE}/api/v3/results/:id`, () => {
    return HttpResponse.json(
      { Message: 'Result not found' },
      { status: 404 }
    );
  }),

  // Patient not found
  patientNotFound: http.get(`${API_BASE}/api/v3/patients/:id`, () => {
    return HttpResponse.json(
      { Message: 'Patient not found' },
      { status: 404 }
    );
  }),

  // Login rate limited
  loginRateLimited: http.post(`${API_BASE}/Api/V2/Authentication/Authorize`, () => {
    return HttpResponse.json(
      { Message: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }),

  // Token refresh fails
  tokenRefreshFailed: http.post(`${API_BASE}/api/v3/authentication/refresh`, () => {
    return HttpResponse.json(
      { Message: 'Token refresh failed' },
      { status: 401 }
    );
  }),
};
