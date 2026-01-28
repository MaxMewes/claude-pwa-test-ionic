export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  TWO_FACTOR: '/two-factor',
  PIN_ENTRY: '/pin-entry',

  // Main tabs
  RESULTS: '/results',
  RESULT_DETAIL: '/results/:id',
  RESULT_CUMULATIVE: '/results/:id/cumulative',

  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',

  LABORATORIES: '/laboratories',
  LABORATORY_DETAIL: '/laboratories/:id',

  SENDERS: '/senders',
  SENDER_DETAIL: '/senders/:id',

  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',

  SETTINGS: '/settings',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_BIOMETRIC: '/settings/biometric',
  SETTINGS_PASSWORD: '/settings/password',
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_FAQ: '/settings/faq',

  // Help
  HELP: '/help',
  HELP_ABOUT: '/help/about',
  HELP_PRIVACY: '/help/privacy',
  HELP_FEEDBACK: '/help/feedback',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
