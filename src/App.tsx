import React, { lazy, Suspense } from 'react';
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
  IonSpinner,
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
  helpCircleOutline,
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

/* Lazy-loaded Auth Pages */
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const TwoFactorPage = lazy(() => import('./features/auth/pages/TwoFactorPage').then(m => ({ default: m.TwoFactorPage })));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

/* Lazy-loaded Results Pages */
const ResultsPage = lazy(() => import('./features/results/pages/ResultsPage').then(m => ({ default: m.ResultsPage })));
const ResultDetailPage = lazy(() => import('./features/results/pages/ResultDetailPage').then(m => ({ default: m.ResultDetailPage })));

/* Lazy-loaded Patients Pages */
const PatientsPage = lazy(() => import('./features/patients/pages/PatientsPage').then(m => ({ default: m.PatientsPage })));
const PatientDetailPage = lazy(() => import('./features/patients/pages/PatientDetailPage').then(m => ({ default: m.PatientDetailPage })));

/* Lazy-loaded Laboratories Pages */
const LaboratoriesPage = lazy(() => import('./features/laboratories/pages/LaboratoriesPage').then(m => ({ default: m.LaboratoriesPage })));
const LaboratoryDetailPage = lazy(() => import('./features/laboratories/pages/LaboratoryDetailPage').then(m => ({ default: m.LaboratoryDetailPage })));
const ServiceDetailPage = lazy(() => import('./features/laboratories/pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));

/* Lazy-loaded News Pages */
const NewsPage = lazy(() => import('./features/news/pages/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = lazy(() => import('./features/news/pages/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })));

/* Lazy-loaded Senders Pages */
const SendersPage = lazy(() => import('./features/senders/pages/SendersPage').then(m => ({ default: m.SendersPage })));
const SenderDetailPage = lazy(() => import('./features/senders/pages/SenderDetailPage').then(m => ({ default: m.SenderDetailPage })));
import { useSenders } from './features/senders/hooks/useSenders';

/* Lazy-loaded Help Pages */
const HelpPage = lazy(() => import('./features/help/pages/HelpPage').then(m => ({ default: m.HelpPage })));
const FeedbackPage = lazy(() => import('./features/help/pages/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const AboutPage = lazy(() => import('./features/help/pages/AboutPage').then(m => ({ default: m.AboutPage })));

/* Lazy-loaded Settings Pages */
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationSettingsPage = lazy(() => import('./features/settings/components/NotificationSettings').then(m => ({ default: m.NotificationSettingsPage })));
const BiometricSettingsPage = lazy(() => import('./features/settings/components/BiometricSettings').then(m => ({ default: m.BiometricSettingsPage })));
const PasswordChangePage = lazy(() => import('./features/settings/pages/PasswordChangePage').then(m => ({ default: m.PasswordChangePage })));
const PrivacyPolicyPage = lazy(() => import('./features/settings/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const FAQPage = lazy(() => import('./features/settings/pages/FAQPage').then(m => ({ default: m.FAQPage })));

/* Shared */
import { ErrorBoundary } from './shared/components';
import { useTheme } from './shared/hooks/useTheme';
import { useSettingsStore, ResultPeriodFilter } from './shared/store/useSettingsStore';

/* Routes */
import { ROUTES } from './config/routes';

setupIonicReact();

// Loading fallback for lazy-loaded pages
const PageLoader: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding">
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
        <IonSpinner name="crescent" />
      </div>
    </IonContent>
  </IonPage>
);

// Menu colors use CSS variables for dark mode support
const MENU_STYLES = {
  brand: 'var(--labgate-brand)',
  text: 'var(--labgate-text)',
  selectedBg: 'var(--labgate-selected-bg)',
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
                <IonIcon slot="start" icon={statsChartOutline} style={{ color: MENU_STYLES.brand }} />
                <IonLabel style={{ color: MENU_STYLES.brand, fontWeight: 500 }}>Meine Befunde</IonLabel>
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
                        '--background': resultsPeriod === item.period ? MENU_STYLES.selectedBg : 'transparent',
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
              <IonIcon slot="start" icon={peopleOutline} style={{ color: MENU_STYLES.brand }} />
              <IonLabel>Meine Patienten</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Meine Labore */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.LABORATORIES} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={flaskOutline} style={{ color: MENU_STYLES.brand }} />
              <IonLabel>Meine Labore</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* News */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.NEWS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={newspaperOutline} style={{ color: MENU_STYLES.brand }} />
              <IonLabel>News</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Einstellungen */}
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink={ROUTES.SETTINGS} routerDirection="root" lines="full">
              <IonIcon slot="start" icon={settingsOutline} style={{ color: MENU_STYLES.brand }} />
              <IonLabel>Einstellungen</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {/* Hilfe - Expandable */}
          <IonAccordionGroup>
            <IonAccordion value="help">
              <IonItem slot="header" lines="full">
                <IonIcon slot="start" icon={helpCircleOutline} style={{ color: MENU_STYLES.brand }} />
                <IonLabel>Hilfe</IonLabel>
              </IonItem>
              <div slot="content">
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    button
                    routerLink={ROUTES.HELP_ABOUT}
                    routerDirection="root"
                    lines="none"
                    style={{ '--padding-start': '48px' }}
                  >
                    <IonLabel>Über</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    button
                    routerLink={ROUTES.SETTINGS_FAQ}
                    routerDirection="root"
                    lines="none"
                    style={{ '--padding-start': '48px' }}
                  >
                    <IonLabel>FAQ</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                <IonMenuToggle autoHide={false}>
                  <IonItem
                    button
                    routerLink={ROUTES.SETTINGS_PRIVACY}
                    routerDirection="root"
                    lines="none"
                    style={{ '--padding-start': '48px' }}
                  >
                    <IonLabel>Datenschutz</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Abmelden */}
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={logout} lines="full">
              <IonIcon slot="start" icon={logOutOutline} style={{ color: MENU_STYLES.brand }} />
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
        <Suspense fallback={<PageLoader />}>
          <Route exact path={ROUTES.LOGIN} component={LoginPage} />
          <Route exact path={ROUTES.REGISTER} component={RegisterPage} />
          <Route exact path={ROUTES.RESET_PASSWORD} component={ResetPasswordPage} />
          <Route exact path={ROUTES.TWO_FACTOR} component={TwoFactorPage} />
          <Route>
            <Redirect to={ROUTES.LOGIN} />
          </Route>
        </Suspense>
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
