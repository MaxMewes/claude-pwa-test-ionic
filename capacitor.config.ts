import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.labgate.app',
  appName: 'labGate',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  },
  server: {
    // Use native HTTP handler to bypass CORS
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#70CC60',
      showSpinner: false
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
