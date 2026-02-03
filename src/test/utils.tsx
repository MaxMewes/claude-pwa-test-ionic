/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

/**
 * Create a QueryClient with test-friendly defaults
 */
export const createTestQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {
        // Suppress error logs in tests
      },
    },
  });
};

interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
}

/**
 * Wrapper component with all necessary providers for testing
 */
export const AllTheProviders = ({
  children,
  queryClient,
  initialRoute = '/',
}: AllTheProvidersProps) => {
  const testQueryClient = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRoute?: string;
}

/**
 * Custom render function that wraps components with all necessary providers
 * 
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 * 
 * @example With custom query client
 * ```tsx
 * const queryClient = createTestQueryClient();
 * const { getByText } = renderWithProviders(<MyComponent />, { queryClient });
 * ```
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { queryClient, initialRoute, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient} initialRoute={initialRoute}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Wait for a specific time (in ms) - useful for async operations
 */
export const wait = (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Helper to wait for next tick (for immediate async operations)
 */
export const waitForNextTick = (): Promise<void> => {
  return wait(0);
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };
