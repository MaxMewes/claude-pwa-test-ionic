import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axiosInstance } from '../api/client/axiosInstance';
import React from 'react';

// This test validates that MSW is properly intercepting API calls
describe('MSW Integration', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

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
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
