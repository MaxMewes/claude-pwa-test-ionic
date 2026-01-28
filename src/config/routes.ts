export const ROUTES = {
  // Auth
  LOGIN: '/login',
  TWO_FACTOR: '/two-factor',
  PIN_ENTRY: '/pin-entry',

  // Main tabs
  RESULTS: '/results',
  RESULT_DETAIL: '/results/:id',

  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',

  LABORATORIES: '/laboratories',
  LABORATORY_DETAIL: '/laboratories/:id',

  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',

  SETTINGS: '/settings',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_BIOMETRIC: '/settings/biometric',
  SETTINGS_PASSWORD: '/settings/password',
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_FAQ: '/settings/faq',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
