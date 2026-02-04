import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {
  documentTextOutline,
  peopleOutline,
  businessOutline,
  newspaperOutline,
  settingsOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

/* Results Pages */
import { ResultsPage } from './features/results/pages/ResultsPage';
import { ResultDetailPage } from './features/results/pages/ResultDetailPage';

/* Patients Pages */
import { PatientsPage } from './features/patients/pages/PatientsPage';
import { PatientDetailPage } from './features/patients/pages/PatientDetailPage';

/* Laboratories Pages */
import { LaboratoriesPage } from './features/laboratories/pages/LaboratoriesPage';
import { LaboratoryDetailPage } from './features/laboratories/pages/LaboratoryDetailPage';
import { ServiceDetailPage } from './features/laboratories/pages/ServiceDetailPage';

/* News Pages */
import { NewsPage } from './features/news/pages/NewsPage';
import { NewsDetailPage } from './features/news/pages/NewsDetailPage';

/* Senders Pages */
import { SendersPage } from './features/senders/pages/SendersPage';
import { SenderDetailPage } from './features/senders/pages/SenderDetailPage';

/* Help Pages */
import { HelpPage } from './features/help/pages/HelpPage';
import { FeedbackPage } from './features/help/pages/FeedbackPage';
import { AboutPage } from './features/help/pages/AboutPage';

/* Settings Pages */
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { NotificationSettingsPage } from './features/settings/components/NotificationSettings';
import { BiometricSettingsPage } from './features/settings/components/BiometricSettings';
import { PasswordChangePage } from './features/settings/pages/PasswordChangePage';
import { PrivacyPolicyPage } from './features/settings/pages/PrivacyPolicyPage';
import { FAQPage } from './features/settings/pages/FAQPage';

import { useSenders } from './features/senders/hooks/useSenders';
import { ROUTES } from './config/routes';

export const MainTabs: React.FC = () => {
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
