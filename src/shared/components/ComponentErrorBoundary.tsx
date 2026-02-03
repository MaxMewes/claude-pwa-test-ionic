import React, { Component, ReactNode } from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';

interface Props {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Size variant: 'small' for inline components, 'medium' for sections */
  size?: 'small' | 'medium';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component-level ErrorBoundary for wrapping specific components.
 * Use this for non-critical components that can fail without breaking the entire page.
 *
 * @example
 * ```tsx
 * <ComponentErrorBoundary onError={logError}>
 *   <TrendChart data={data} />
 * </ComponentErrorBoundary>
 * ```
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log in development to avoid console spam in production
    if (import.meta.env.DEV) {
      console.error('ComponentErrorBoundary caught an error:', error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError } = this.state;
    const {
      children,
      fallback,
      showRetry = true,
      errorMessage = 'Inhalt konnte nicht geladen werden',
      size = 'medium'
    } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const isSmall = size === 'small';

      return (
        <div
          role="alert"
          aria-live="polite"
          style={{
            display: 'flex',
            flexDirection: isSmall ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isSmall ? '12px' : '24px',
            gap: isSmall ? '8px' : '12px',
            backgroundColor: 'var(--ion-color-light)',
            borderRadius: '8px',
            minHeight: isSmall ? 'auto' : '120px',
          }}
        >
          <IonIcon
            icon={alertCircleOutline}
            aria-hidden="true"
            style={{
              fontSize: isSmall ? '20px' : '32px',
              color: 'var(--ion-color-medium)',
              flexShrink: 0,
            }}
          />
          <IonText color="medium" style={{ textAlign: isSmall ? 'left' : 'center' }}>
            <span style={{ fontSize: isSmall ? '13px' : '14px' }}>
              {errorMessage}
            </span>
          </IonText>
          {showRetry && (
            <IonButton
              fill="clear"
              size="small"
              onClick={this.handleRetry}
              style={{ flexShrink: 0 }}
            >
              <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
              Wiederholen
            </IonButton>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with ComponentErrorBoundary.
 *
 * @example
 * ```tsx
 * const SafeTrendChart = withErrorBoundary(TrendChart, {
 *   errorMessage: 'Trend konnte nicht geladen werden',
 *   size: 'medium',
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ComponentErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ComponentErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}
