// App Configuration
export const APP_CONFIG = {
  // App Version - Update this with each release
  version: '1.0.0',

  // API Configuration
  api: {
    // Base URL - uses Vite proxy in dev, env variable in prod
    baseUrl: import.meta.env.VITE_API_URL || 'https://demo.labgate.net',

    // API Version
    version: 'v3',

    // Full API path
    get fullPath() {
      return `${this.baseUrl}/api/${this.version}`;
    },
  },

  // Build info
  build: {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
} as const;

// Helper to get display-friendly API URL
export const getDisplayApiUrl = (): string => {
  if (import.meta.env.DEV) {
    // In development, show the proxy target
    return import.meta.env.VITE_API_URL || 'https://demo.labgate.net';
  }
  return APP_CONFIG.api.baseUrl || 'https://demo.labgate.net';
};
