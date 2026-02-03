import React, { Component, ReactNode } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, IonText } from '@ionic/react';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
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
                <h2 style={{ margin: '0 0 8px 0' }}>Ein Fehler ist aufgetreten</h2>
              </IonText>
              <IonText color="medium">
                <p style={{ margin: '0 0 24px 0' }}>
                  Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
                </p>
              </IonText>
              <IonButton onClick={this.handleRetry}>
                <IonIcon slot="start" icon={refreshOutline} />
                Erneut versuchen
              </IonButton>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return this.props.children;
  }
}
