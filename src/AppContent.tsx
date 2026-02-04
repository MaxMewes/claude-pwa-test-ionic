import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonRouterOutlet, IonPage } from '@ionic/react';
import { useAuthStore } from './features/auth/store/authStore';

/* Auth Pages */
import { LoginPage } from './features/auth/pages/LoginPage';
import { TwoFactorPage } from './features/auth/pages/TwoFactorPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';

import { AppMenu } from './AppMenu';
import { MainTabs } from './MainTabs';
import { ROUTES } from './config/routes';

export const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // If not authenticated, show auth routes
  if (!isAuthenticated) {
    return (
      <IonRouterOutlet>
        <Route exact path={ROUTES.LOGIN} component={LoginPage} />
        <Route exact path={ROUTES.REGISTER} component={RegisterPage} />
        <Route exact path={ROUTES.RESET_PASSWORD} component={ResetPasswordPage} />
        <Route exact path={ROUTES.TWO_FACTOR} component={TwoFactorPage} />
        <Route>
          <Redirect to={ROUTES.LOGIN} />
        </Route>
      </IonRouterOutlet>
    );
  }

  // If authenticated, show main app with tabs and menu
  return (
    <>
      <AppMenu />
      <IonPage id="main-content">
        <MainTabs />
      </IonPage>
    </>
  );
};
