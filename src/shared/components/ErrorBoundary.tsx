import React, { Component, ReactNode } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, IonText } from '@ionic/react';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches and displays errors in the application.
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you would send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // TODO: Send error to external error tracking service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { t } = this.props;
    
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <IonPage>
          <IonContent>
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <IonIcon
                icon={alertCircleOutline}
                aria-hidden="true"
                style={{
                  fontSize: '64px',
                  color: 'var(--ion-color-danger)',
                  marginBottom: '16px',
                }}
              />
              <IonText color="dark">
                <h2 style={{ margin: '0 0 8px 0' }}>{t('errors.boundary.title')}</h2>
              </IonText>
              <IonText color="medium">
                <p style={{ margin: '0 0 24px 0' }}>
                  {t('errors.boundary.message')}
                </p>
              </IonText>
              <IonButton onClick={this.handleRetry} aria-label={t('errors.boundary.retry')}>
                <IonIcon slot="start" icon={refreshOutline} aria-hidden="true" />
                {t('errors.boundary.retry')}
              </IonButton>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);
