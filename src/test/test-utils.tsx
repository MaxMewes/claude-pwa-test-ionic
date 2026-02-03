/**
 * Test Utilities
 *
 * Provides helper functions for rendering components in tests with all necessary providers.
 * Use these instead of importing directly from @testing-library/react.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// Initialize Ionic for tests
setupIonicReact({ mode: 'ios' });

/**
 * Create a fresh QueryClient for each test
 */
export function createTestQueryClient(): QueryClient {
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
  });
}

/**
 * Props for the AllProviders wrapper
 */
interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

/**
 * Wrapper component that includes all necessary providers
 */
function AllProviders({
  children,
  queryClient = createTestQueryClient(),
  routerProps = { initialEntries: ['/'] },
}: AllProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter {...routerProps}>
        <IonApp>{children}</IonApp>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

/**
 * Custom render function that wraps components with all providers
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { queryClient = createTestQueryClient(), routerProps, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders queryClient={queryClient} routerProps={routerProps}>
      {children}
    </AllProviders>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient,
  };
}

/**
 * Render with just React Query provider (no router)
 */
export function renderWithQueryClient(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient()
): RenderResult & { queryClient: QueryClient } {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const result = render(ui, { wrapper: Wrapper });

  return {
    ...result,
    queryClient,
  };
}

/**
 * Render with just router provider (no React Query)
 */
export function renderWithRouter(
  ui: ReactElement,
  routerProps: MemoryRouterProps = { initialEntries: ['/'] }
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter {...routerProps}>
      <IonApp>{children}</IonApp>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper });
}

/**
 * Render with Ionic Router (for testing with IonRouterOutlet)
 */
export function renderWithIonicRouter(
  ui: ReactElement,
  routerProps: MemoryRouterProps = { initialEntries: ['/'] }
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>{children}</IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

/**
 * Wait for loading states to resolve
 */
export async function waitForLoadingToFinish(): Promise<void> {
  // Wait for any pending promises
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper to wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  { timeout = 5000, interval = 50 } = {}
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Re-export userEvent
export { default as userEvent } from '@testing-library/user-event';
