import React from 'react';
import { setupIonicReact } from '@ionic/react';

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

/* Micro interactions for modern feel */
import './theme/micro-interactions.css';

/* App Components */
import { AppProviders } from './AppProviders';
import { AppContent } from './AppContent';

/* Hooks */
import { useAutoLogout } from './features/auth/hooks/useAutoLogout';
import { useTheme } from './shared/hooks/useTheme';

setupIonicReact();

const App: React.FC = () => {
  // Auto logout on inactivity
  useAutoLogout();
  // Initialize theme on app startup
  useTheme();

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
