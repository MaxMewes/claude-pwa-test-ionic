# Testing Infrastructure

This document describes the testing infrastructure setup for the project.

## Overview

The project uses the following testing tools:

- **Vitest**: Fast unit test framework
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: API mocking for tests and development
- **@faker-js/faker**: Test data generation

## Test Data Factories

Test data factories are located in `src/test/factories/` and provide consistent mock data for testing.

### Available Factories

#### User Factory (`userFactory.ts`)
```typescript
import { createMockUser, createMockAdmin, createMockPatientUser } from '@/test/factories';

const user = createMockUser();
const admin = createMockAdmin({ email: 'admin@example.com' });
const patient = createMockPatientUser();
```

#### Patient Factory (`patientFactory.ts`)
```typescript
import { createMockPatient, createMockPatients } from '@/test/factories';

const patient = createMockPatient({ Firstname: 'John' });
const patients = createMockPatients(10); // Create 10 patients
```

#### Laboratory Factory (`laboratoryFactory.ts`)
```typescript
import { createMockLaboratory, createMockLaboratories } from '@/test/factories';

const lab = createMockLaboratory({ Name: 'Test Lab' });
const labs = createMockLaboratories(5);
```

#### Result Factory (`resultFactory.ts`)
```typescript
import {
  createMockLabResult,
  createMockLabResults,
  createMockPathologicalResult,
  createMockUrgentResult
} from '@/test/factories';

const result = createMockLabResult();
const results = createMockLabResults(20);
const pathologicalResult = createMockPathologicalResult();
const urgentResult = createMockUrgentResult();
```

## Test Utilities

The `src/test/utils.tsx` file provides custom render functions and utilities:

### Custom Render

```typescript
import { renderWithProviders } from '@/test/utils';

test('renders component', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Hello')).toBeInTheDocument();
});
```

### Custom Query Client

```typescript
import { createTestQueryClient, renderWithProviders } from '@/test/utils';

const queryClient = createTestQueryClient();
renderWithProviders(<MyComponent />, { queryClient });
```

### Router Support

```typescript
import { renderWithProviders } from '@/test/utils';

renderWithProviders(<MyComponent />, { initialRoute: '/results' });
```

## MSW (Mock Service Worker)

MSW intercepts network requests and provides mock responses for testing.

### Setup

MSW is automatically configured in `setupTests.ts` and runs for all tests.

### Available Endpoints

The following endpoints are mocked:

#### Authentication (V2)
- `POST /Api/V2/Authentication/Authorize` - Login
- `POST /Api/V2/Authentication/Verify2FALogin` - 2FA verification
- `POST /authentication/logout` - Logout

#### Results (V3)
- `GET /api/v3/results` - Get results list
- `GET /api/v3/results/:id` - Get single result
- `GET /api/v3/results/counter` - Get result counters
- `PATCH /api/v3/results/mark-as-read` - Mark as read
- `PATCH /api/v3/results/mark-as-favorite` - Mark as favorite
- More result endpoints...

#### Patients (V3)
- `GET /api/v3/patients` - Get patients list
- `GET /api/v3/patients/:id` - Get single patient

#### Laboratories (V3)
- `GET /api/v3/laboratories` - Get laboratories list
- `GET /api/v3/laboratories/:id` - Get single laboratory

### Custom Handlers

You can override MSW handlers in individual tests:

```typescript
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

test('handles error', async () => {
  server.use(
    http.get('/api/v3/results', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );
  
  // Test error handling...
});
```

## Running Tests

```bash
# Run all tests
npm run test.unit

# Run tests in watch mode
npm run test.unit -- --watch

# Run specific test file
npm run test.unit -- src/features/results/hooks/useResults.test.ts

# Run with coverage
npm run test.unit -- --coverage
```

## Coverage Requirements

The project has coverage thresholds configured:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Coverage is tracked for:
- `src/shared/**/*.{ts,tsx}`
- `src/features/**/store/**/*.{ts,tsx}`
- `src/features/**/hooks/**/*.{ts,tsx}`
- `src/config/**/*.{ts,tsx}`

Excluded from coverage:
- Test files (`*.test.{ts,tsx}`)
- Mock files (`**/mocks/**`)
- Type definitions (`**/*.d.ts`, `**/types/**`)
- Test utilities (`**/test/**`)

## Error Boundary

The `ErrorBoundary` component has been enhanced with:

- `role="alert"` and `aria-live="assertive"` for accessibility
- Error reporting hooks for production (TODO: integrate with error tracking service)
- Placeholder for external error tracking service integration

### Usage

```typescript
import { ErrorBoundary } from '@/shared/components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Error Reporting

In production, errors caught by ErrorBoundary should be sent to an external error tracking service (e.g., Sentry, LogRocket). The infrastructure is in place - just uncomment and configure the service in `ErrorBoundary.tsx`:

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  if (import.meta.env.PROD) {
    // TODO: Configure your error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }
}
```

## Best Practices

1. **Use factories for test data**: Always use the factory functions to create mock data instead of manually creating objects.

2. **Use renderWithProviders**: Use the custom render function that includes all necessary providers (QueryClient, Router).

3. **Clean up after tests**: MSW handlers are automatically reset after each test.

4. **Test accessibility**: ErrorBoundary now includes proper ARIA attributes - ensure your components are accessible too.

5. **Mock network requests**: Use MSW to mock API calls instead of mocking axios directly.

6. **Keep tests focused**: Each test should test one thing.

7. **Use meaningful test names**: Test names should describe what is being tested.

## Troubleshooting

### Tests timing out
Increase the timeout in your test:
```typescript
test('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

### MSW not intercepting requests
Make sure the request URL matches exactly what's in the handlers. Check the network tab in test output.

### Query not updating
Use `waitFor` from Testing Library:
```typescript
await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```
