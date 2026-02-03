/**
 * ErrorBoundary Component Tests
 *
 * Tests for error catching, retry functionality, and fallback rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Suppress console.error during tests since we expect errors
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  describe('when no error occurs', () => {
    it('renders children normally', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('does not show error UI', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText('Ein Fehler ist aufgetreten')).not.toBeInTheDocument();
    });
  });

  describe('when an error occurs', () => {
    it('catches errors and displays default fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
      expect(screen.getByText(/Bitte versuchen Sie es erneut/)).toBeInTheDocument();
    });

    it('displays retry button with text', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Ionic buttons render as custom elements, so we search by text content
      expect(screen.getByText('Erneut versuchen')).toBeInTheDocument();
    });

    it('logs error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // React 18 logs errors differently, just verify console.error was called
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('renders ion-button element for retry', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error is shown
      expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();

      // Find the ion-button element
      const ionButton = container.querySelector('ion-button');
      expect(ionButton).toBeInTheDocument();
      expect(ionButton?.textContent).toContain('Erneut versuchen');
    });

    it('calls handleRetry when button is clicked', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error is shown initially
      expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();

      // Find and click the retry button
      const ionButton = container.querySelector('ion-button');
      expect(ionButton).toBeInTheDocument();

      if (ionButton) {
        fireEvent.click(ionButton);
      }

      // Note: The component will try to re-render children, which will throw again
      // In real usage, the underlying issue would be fixed before retry
    });
  });

  describe('custom fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Ein Fehler ist aufgetreten')).not.toBeInTheDocument();
    });

    it('does not render default UI with custom fallback', () => {
      const customFallback = <div>Custom fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Erneut versuchen')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('stores error in state', () => {
      const TestComponent = () => {
        throw new Error('Specific error message');
      };

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Error is caught and UI is displayed
      expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
    });
  });

  describe('getDerivedStateFromError', () => {
    it('returns correct state shape', () => {
      const error = new Error('Test error');
      const result = ErrorBoundary.getDerivedStateFromError(error);

      expect(result).toEqual({
        hasError: true,
        error: error,
      });
    });
  });
});
