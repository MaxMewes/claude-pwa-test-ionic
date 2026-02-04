# Example: Writing Tests with MSW

This guide shows how to write tests using MSW instead of directly mocking axios.

## ❌ Old Way (Mocking Axios Directly)

```typescript
import { vi } from 'vitest';
import { axiosInstance } from '@/api/client/axiosInstance';

vi.mock('@/api/client/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockAxios = vi.mocked(axiosInstance);

test('fetches data', async () => {
  mockAxios.get.mockResolvedValue({
    data: { results: [] }
  });
  
  // Test code...
  
  expect(mockAxios.get).toHaveBeenCalledWith('/api/endpoint');
});
```

## ✅ New Way (Using MSW)

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient, renderWithProviders } from '@/test/utils';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test('fetches data using MSW', async () => {
  // MSW automatically intercepts the request
  const { result } = renderHook(() => useYourHook(), { 
    wrapper: createWrapper() 
  });
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
  
  // Test the actual data, not the mock calls
  expect(result.current.data?.results).toEqual(expect.any(Array));
});
```

## Customizing MSW Responses

```typescript
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

test('handles error responses', async () => {
  // Override the default handler for this test
  server.use(
    http.get('/api/v3/results', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );
  
  const { result } = renderHook(() => useResults(), { 
    wrapper: createWrapper() 
  });
  
  await waitFor(() => {
    expect(result.current.error).toBeDefined();
  });
  
  expect(result.current.error?.message).toContain('Server error');
});
```

## Using Test Factories

```typescript
import { createMockLabResults } from '@/test/factories';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

test('renders specific mock data', async () => {
  // Create custom mock data
  const mockResults = createMockLabResults(5);
  
  // Override handler to return our specific data
  server.use(
    http.get('/api/v3/results', () => {
      return HttpResponse.json({
        Results: mockResults,
        TotalCount: mockResults.length,
        CurrentPage: 1,
        ItemsPerPage: 25,
      });
    })
  );
  
  const { getByText } = renderWithProviders(<ResultsList />);
  
  await waitFor(() => {
    expect(getByText(mockResults[0].LabNo)).toBeInTheDocument();
  });
});
```

## Testing Component Behavior

```typescript
import { renderWithProviders } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('component interacts with API', async () => {
  const user = userEvent.setup();
  
  renderWithProviders(<MyComponent />);
  
  const button = screen.getByRole('button', { name: /load data/i });
  await user.click(button);
  
  // MSW will automatically intercept and respond
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  });
});
```

## Key Differences

1. **No axios mocking needed** - MSW intercepts at the network level
2. **Test behavior, not implementation** - Focus on what the user sees
3. **More realistic tests** - Actually makes HTTP requests (intercepted by MSW)
4. **Easier to maintain** - Changes to axios implementation don't break tests

## Migration Checklist

When updating old tests:

- [ ] Remove axios mock imports and setup
- [ ] Remove expectations on `mockAxios.get/post.toHaveBeenCalled`
- [ ] Use `renderWithProviders` or create wrapper with QueryClient
- [ ] Wait for data using `waitFor(() => expect(result.current.data).toBeDefined())`
- [ ] Test the actual data/behavior instead of mock calls
- [ ] Use MSW handlers to customize responses when needed
- [ ] Use test factories for consistent mock data
