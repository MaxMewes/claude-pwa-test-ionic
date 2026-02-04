import { http, HttpResponse } from 'msw';
import {
  createMockLabResults,
  createMockLabResult,
  createMockPatients,
  createMockLaboratories,
  createMockUser,
} from '../test/factories';

// Base URL for API
const API_BASE_URL = '/api/v3';
const API_V2_BASE_URL = '/Api/V2';

export const handlers = [
  // Authentication endpoints (V2)
  http.post(`${API_V2_BASE_URL}/Authentication/Authorize`, async ({ request }) => {
    const body = await request.json() as { Username: string; Password: string };
    
    // Simulate login failure for specific credentials
    if (body.Username === 'invalid' || body.Password === 'wrong') {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Simulate 2FA requirement
    if (body.Username === '2fa-user') {
      return HttpResponse.json({
        Token: 'temp-token-123',
        PasswordExpired: false,
        RequiresSecondFactor: true,
        TwoFactorRegistrationIncomplete: false,
        Fullname: 'Test User',
        Email: 'test@example.com',
      });
    }

    // Normal successful login
    return HttpResponse.json({
      Token: 'mock-auth-token-123',
      PasswordExpired: false,
      RequiresSecondFactor: false,
      TwoFactorRegistrationIncomplete: false,
      Fullname: 'Test User',
      Firstname: 'Test',
      Lastname: 'User',
      Email: body.Username,
    });
  }),

  http.post(`${API_V2_BASE_URL}/Authentication/Verify2FALogin`, async ({ request }) => {
    const body = await request.json() as { Code: string };
    
    if (body.Code === 'wrong-code') {
      return HttpResponse.json(
        { error: 'Invalid 2FA code' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      Token: 'mock-auth-token-after-2fa',
      Fullname: 'Test User',
      Email: 'test@example.com',
    });
  }),

  http.post('/authentication/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Results endpoints (V3)
  http.get(`${API_BASE_URL}/results`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('CurrentPage') || '1');
    const itemsPerPage = parseInt(url.searchParams.get('ItemsPerPage') || '25');
    const search = url.searchParams.get('Query');
    
    const allResults = createMockLabResults(50);
    let filteredResults = allResults;

    // Apply search filter
    if (search) {
      filteredResults = allResults.filter(
        (result) =>
          result.LabNo.toLowerCase().includes(search.toLowerCase()) ||
          result.Patient.Fullname?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return HttpResponse.json({
      Results: paginatedResults,
      TotalCount: filteredResults.length,
      CurrentPage: page,
      ItemsPerPage: itemsPerPage,
      TotalPages: Math.ceil(filteredResults.length / itemsPerPage),
    });
  }),

  http.get(`${API_BASE_URL}/results/:id`, ({ params }) => {
    const { id } = params;
    const result = createMockLabResult({ Id: Number(id) });
    
    return HttpResponse.json({
      Result: result,
      Sender: result.Sender,
      LaboratoryName: result.Laboratory?.Name,
      LaboratoryId: result.Laboratory?.Id,
    });
  }),

  http.get(`${API_BASE_URL}/results/counter`, () => {
    return HttpResponse.json({
      TotalCount: 100,
      NonReadCount: 10,
      PathologicalCount: 5,
      HighPathologicalCount: 2,
      UrgentCount: 1,
    });
  }),

  http.patch(`${API_BASE_URL}/results/mark-as-read`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE_URL}/results/mark-as-unread`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE_URL}/results/mark-as-favorite`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE_URL}/results/mark-as-not-favorite`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE_URL}/results/mark-as-archived`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE_URL}/results/mark-as-not-archived`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch(`${API_BASE_URL}/results/:id/pin`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Patients endpoints (V3)
  http.get(`${API_BASE_URL}/patients`, () => {
    const patients = createMockPatients(20);
    
    return HttpResponse.json({
      Results: patients,
      TotalCount: patients.length,
      CurrentPage: 1,
      ItemsPerPage: 25,
      TotalPages: 1,
    });
  }),

  http.get(`${API_BASE_URL}/patients/:id`, ({ params }) => {
    const mockPatients = createMockPatients(1);
    const patient = { ...mockPatients[0], Id: Number(params.id) };
    
    return HttpResponse.json(patient);
  }),

  // Laboratories endpoints (V3)
  http.get(`${API_BASE_URL}/laboratories`, () => {
    const laboratories = createMockLaboratories(10);
    
    return HttpResponse.json({
      Results: laboratories,
      TotalCount: laboratories.length,
      CurrentPage: 1,
      ItemsPerPage: 25,
      TotalPages: 1,
    });
  }),

  http.get(`${API_BASE_URL}/laboratories/:id`, ({ params }) => {
    const mockLabs = createMockLaboratories(1);
    const laboratory = { ...mockLabs[0], Id: Number(params.id) };
    
    return HttpResponse.json(laboratory);
  }),

  // Senders endpoints (V3)
  http.get(`${API_BASE_URL}/senders`, () => {
    return HttpResponse.json({
      Results: [],
      TotalCount: 0,
      CurrentPage: 1,
      ItemsPerPage: 25,
      TotalPages: 0,
    });
  }),

  // News endpoints (V3)
  http.get(`${API_BASE_URL}/news`, () => {
    return HttpResponse.json({
      Results: [],
      TotalCount: 0,
      CurrentPage: 1,
      ItemsPerPage: 25,
      TotalPages: 0,
    });
  }),

  // User info endpoint
  http.get('/api/user', () => {
    return HttpResponse.json(createMockUser());
  }),
];
