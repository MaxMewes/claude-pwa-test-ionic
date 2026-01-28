import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  documentTextOutline,
  peopleOutline,
  businessOutline,
  newspaperOutline,
  settingsOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Auth */
import { useAuthStore } from './features/auth/store/authStore';
import { useAutoLogout } from './features/auth/hooks/useAutoLogout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { TwoFactorPage } from './features/auth/pages/TwoFactorPage';

/* Results */
import { ResultsPage } from './features/results/pages/ResultsPage';
import { ResultDetailPage } from './features/results/pages/ResultDetailPage';

/* Patients */
import { PatientsPage } from './features/patients/pages/PatientsPage';
import { PatientDetailPage } from './features/patients/pages/PatientDetailPage';

/* Laboratories */
import { LaboratoriesPage } from './features/laboratories/pages/LaboratoriesPage';
import { LaboratoryDetailPage } from './features/laboratories/pages/LaboratoryDetailPage';

/* News */
import { NewsPage } from './features/news/pages/NewsPage';
import { NewsDetailPage } from './features/news/pages/NewsDetailPage';

/* Settings */
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { NotificationSettingsPage } from './features/settings/components/NotificationSettings';
import { BiometricSettingsPage } from './features/settings/components/BiometricSettings';
import { PasswordChangePage } from './features/settings/pages/PasswordChangePage';
import { PrivacyPolicyPage } from './features/settings/pages/PrivacyPolicyPage';
import { FAQPage } from './features/settings/pages/FAQPage';

/* Shared */
import { ErrorBoundary } from './shared/components';
import { useTheme } from './shared/hooks/useTheme';

/* Routes */
import { ROUTES } from './config/routes';

setupIonicReact();

const MainTabs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={ROUTES.RESULTS} component={ResultsPage} />
        <Route path="/results/:id" component={ResultDetailPage} />

        <Route exact path={ROUTES.PATIENTS} component={PatientsPage} />
        <Route path="/patients/:id" component={PatientDetailPage} />

        <Route exact path={ROUTES.LABORATORIES} component={LaboratoriesPage} />
        <Route path="/laboratories/:id" component={LaboratoryDetailPage} />

        <Route exact path={ROUTES.NEWS} component={NewsPage} />
        <Route path="/news/:id" component={NewsDetailPage} />

        <Route exact path={ROUTES.SETTINGS} component={SettingsPage} />
        <Route path={ROUTES.SETTINGS_NOTIFICATIONS} component={NotificationSettingsPage} />
        <Route path={ROUTES.SETTINGS_BIOMETRIC} component={BiometricSettingsPage} />
        <Route path={ROUTES.SETTINGS_PASSWORD} component={PasswordChangePage} />
        <Route path={ROUTES.SETTINGS_PRIVACY} component={PrivacyPolicyPage} />
        <Route path={ROUTES.SETTINGS_FAQ} component={FAQPage} />

        <Route exact path="/">
          <Redirect to={ROUTES.RESULTS} />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="results" href={ROUTES.RESULTS}>
          <IonIcon icon={documentTextOutline} />
          <IonLabel>{t('results.title')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="patients" href={ROUTES.PATIENTS}>
          <IonIcon icon={peopleOutline} />
          <IonLabel>{t('patients.title')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="laboratories" href={ROUTES.LABORATORIES}>
          <IonIcon icon={businessOutline} />
          <IonLabel>{t('laboratories.title')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="news" href={ROUTES.NEWS}>
          <IonIcon icon={newspaperOutline} />
          <IonLabel>{t('news.title')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="settings" href={ROUTES.SETTINGS}>
          <IonIcon icon={settingsOutline} />
          <IonLabel>{t('settings.title')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // If not authenticated, show auth routes
  if (!isAuthenticated) {
    return (
      <IonRouterOutlet>
        <Route exact path={ROUTES.LOGIN} component={LoginPage} />
        <Route exact path={ROUTES.TWO_FACTOR} component={TwoFactorPage} />
        <Route>
          <Redirect to={ROUTES.LOGIN} />
        </Route>
      </IonRouterOutlet>
    );
  }

  // If authenticated, show main app with tabs
  return <MainTabs />;
};

const App: React.FC = () => {
  // Auto logout on inactivity
  useAutoLogout();
  // Initialize theme on app startup
  useTheme();

  return (
    <ErrorBoundary>
      <IonApp>
        <IonReactRouter>
          <AppContent />
        </IonReactRouter>
      </IonApp>
    </ErrorBoundary>
  );
};

export default App;
