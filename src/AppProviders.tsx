import React from 'react';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ErrorBoundary } from './shared/components';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <IonApp>
        <IonReactRouter>
          {children}
        </IonReactRouter>
      </IonApp>
    </ErrorBoundary>
  );
};
