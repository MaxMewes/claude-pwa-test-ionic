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
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonMenuToggle,
  IonAccordionGroup,
  IonAccordion,
  IonPage,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  documentTextOutline,
  peopleOutline,
  businessOutline,
  newspaperOutline,
  settingsOutline,
  logOutOutline,
  statsChartOutline,
  flaskOutline,
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
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';

/* Results */
import { ResultsPage } from './features/results/pages/ResultsPage';
import { ResultDetailPage } from './features/results/pages/ResultDetailPage';

/* Patients */
import { PatientsPage } from './features/patients/pages/PatientsPage';
import { PatientDetailPage } from './features/patients/pages/PatientDetailPage';

/* Laboratories */
import { LaboratoriesPage } from './features/laboratories/pages/LaboratoriesPage';
import { LaboratoryDetailPage } from './features/laboratories/pages/LaboratoryDetailPage';
import { ServiceDetailPage } from './features/laboratories/pages/ServiceDetailPage';

/* News */
import { NewsPage } from './features/news/pages/NewsPage';
import { NewsDetailPage } from './features/news/pages/NewsDetailPage';

/* Senders */
import { SendersPage } from './features/senders/pages/SendersPage';
import { SenderDetailPage } from './features/senders/pages/SenderDetailPage';
import { useSenders } from './features/senders/hooks/useSenders';

/* Help */
import { HelpPage } from './features/help/pages/HelpPage';
import { FeedbackPage } from './features/help/pages/FeedbackPage';
import { AboutPage } from './features/help/pages/AboutPage';

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
import { useSettingsStore, ResultPeriodFilter } from './shared/store/useSettingsStore';

/* Routes */
import { ROUTES } from './config/routes';

setupIonicReact();

const MENU_COLORS = {
  brand: '#70CC60',
  text: '#3C3C3B',
  selectedBg: '#E8F5E6',
};

const AppMenu: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const { resultsPeriod, setResultsPeriod } = useSettingsStore();

  const resultsSubItems: { title: string; period: ResultPeriodFilter }[] = [
    { title: 'Heute', period: 'today' },
    { title: 'Letzten 7 Tage', period: '7days' },
    { title: 'Letzten 30 Tage', period: '30days' },
    { title: 'Alle', period: 'all' },
    { title: 'Archiv', period: 'archive' },
  ];

  const handlePeriodSelect = (period: ResultPeriodFilter) => {
    setResultsPeriod(period);
  };

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonContent>
        <IonList lines="full" style={{ paddingTop: '16px' }}>
          {/* Meine Befunde - Expandable (default open) */}
          <IonAccordionGroup value="results">
            <IonAccordion value="results">
              <IonItem slot="header" lines="full">
                <IonIcon slot="start" icon={statsChartOutline} style={{ color: MENU_COLORS.brand }} />
                <IonLabel style={{ color: MENU_COLORS.brand, fontWeight: 500 }}>Meine Befunde</IonLabel>
              </IonItem>
              <div slot="content">
                {resultsSubItems.map((item, index) => (
                  <IonMenuToggle key={index} autoHide={false}>
                    <IonItem
                      button
                      routerLink={ROUTES.RESULTS}
                      routerDirection="root"
                      lines="none"
                      style={{
                        '--padding-start': '48px',
                        '--background': resultsPeriod === item.period ? MENU_COLORS.selectedBg : 'transparent',
                      }}
                      onClick={() => handlePeriodSelect(item.period)}
                    >
                      <IonLabel style={{ fontWeight: resultsPeriod === item.period ? 600 : 400 }}>
                        {item.title}
                      </IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                ))}
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Meine Patienten */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.PATIENTS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={peopleOutline} style={{ color: MENU_COLORS.brand }} />
              <IonLabel>Meine Patienten</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Meine Labore */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.LABORATORIES} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={flaskOutline} style={{ color: MENU_COLORS.brand }} />
              <IonLabel>Meine Labore</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* News */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.NEWS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={newspaperOutline} style={{ color: MENU_COLORS.brand }} />
              <IonLabel>News</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Einstellungen */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.SETTINGS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={settingsOutline} style={{ color: MENU_COLORS.brand }} />
              <IonLabel>Einstellungen</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Abmelden */}
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={logout} lines="full">
              <IonIcon slot="start" icon={logOutOutline} style={{ color: MENU_COLORS.brand }} />
              <IonLabel>Abmelden</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  // Load senders on mount to auto-select first sender
  useSenders();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={ROUTES.RESULTS} component={ResultsPage} />
        <Route path="/results/:id" component={ResultDetailPage} />

        <Route exact path={ROUTES.PATIENTS} component={PatientsPage} />
        <Route path="/patients/:id" component={PatientDetailPage} />

        <Route exact path={ROUTES.LABORATORIES} component={LaboratoriesPage} />
        <Route exact path={ROUTES.SERVICE_DETAIL} component={ServiceDetailPage} />
        <Route path="/laboratories/:id" component={LaboratoryDetailPage} />

        <Route exact path={ROUTES.NEWS} component={NewsPage} />
        <Route path="/news/:id" component={NewsDetailPage} />

        <Route exact path={ROUTES.SENDERS} component={SendersPage} />
        <Route path="/senders/:id" component={SenderDetailPage} />

        <Route exact path={ROUTES.SETTINGS} component={SettingsPage} />
        <Route path={ROUTES.SETTINGS_NOTIFICATIONS} component={NotificationSettingsPage} />
        <Route path={ROUTES.SETTINGS_BIOMETRIC} component={BiometricSettingsPage} />
        <Route path={ROUTES.SETTINGS_PASSWORD} component={PasswordChangePage} />
        <Route path={ROUTES.SETTINGS_PRIVACY} component={PrivacyPolicyPage} />
        <Route path={ROUTES.SETTINGS_FAQ} component={FAQPage} />

        <Route exact path={ROUTES.HELP} component={HelpPage} />
        <Route path={ROUTES.HELP_ABOUT} component={AboutPage} />
        <Route path={ROUTES.HELP_PRIVACY} component={PrivacyPolicyPage} />
        <Route path={ROUTES.HELP_FEEDBACK} component={FeedbackPage} />

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
