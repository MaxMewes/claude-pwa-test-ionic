// vitest globals available via config
import { axiosInstance } from '../api/client/axiosInstance';

// This test validates that MSW is properly intercepting API calls
describe('MSW Integration', () => {
  it('should intercept authentication API calls', async () => {
    const response = await axiosInstance.post('/Api/V2/Authentication/Authorize', {
      Username: 'test@example.com',
      Password: 'password123',
    });

    expect(response.data).toBeDefined();
    expect(response.data.Token).toBeDefined();
    expect(response.data.Token).toBe('mock-auth-token-123');
  });

  it('should intercept results API calls', async () => {
    const response = await axiosInstance.get('/api/v3/results');

    expect(response.data).toBeDefined();
    expect(response.data.Results).toBeDefined();
    expect(Array.isArray(response.data.Results)).toBe(true);
    expect(response.data.TotalCount).toBeGreaterThan(0);
  });

  it('should intercept patients API calls', async () => {
    const response = await axiosInstance.get('/api/v3/patients');

    expect(response.data).toBeDefined();
    expect(response.data.Results).toBeDefined();
    expect(Array.isArray(response.data.Results)).toBe(true);
    expect(response.data.Results.length).toBeGreaterThan(0);
  });

  it('should intercept laboratories API calls', async () => {
    const response = await axiosInstance.get('/api/v3/laboratories');

    expect(response.data).toBeDefined();
    expect(response.data.Results).toBeDefined();
    expect(Array.isArray(response.data.Results)).toBe(true);
  });

  it('should handle search queries in results endpoint', async () => {
    const response = await axiosInstance.get('/api/v3/results', {
      params: {
        Query: 'LAB',
      },
    });

    expect(response.data).toBeDefined();
    expect(response.data.Results).toBeDefined();
    expect(Array.isArray(response.data.Results)).toBe(true);
  });

  it('should handle 2FA authentication flow', async () => {
    const response = await axiosInstance.post('/Api/V2/Authentication/Authorize', {
      Username: '2fa-user',
      Password: 'password123',
    });

    expect(response.data.RequiresSecondFactor).toBe(true);
    expect(response.data.Token).toBeDefined();
  });

  it('should handle invalid credentials', async () => {
    try {
      await axiosInstance.post('/Api/V2/Authentication/Authorize', {
        Username: 'invalid',
        Password: 'wrong',
      });
      // Should not reach here - request should fail
      throw new Error('Expected request to fail with 401');
    } catch (error) {
      const errorResponse = error as { response: { status: number }; message?: string };
      // Check if this is the expected API error, not our thrown error
      if (errorResponse.message?.includes('Expected request to fail')) {
        throw error;
      }
      expect(errorResponse.response.status).toBe(401);
    }
  });
});
