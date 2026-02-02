# labGate PWA

A Progressive Web Application for accessing medical laboratory results, built with Ionic React and Capacitor.

## Features

- View lab results and test data
- Patient management
- Laboratory directory
- News and updates
- Offline support (PWA)
- Multi-language support (German)
- Favorites and search functionality
- Barcode scanning for quick access

## Tech Stack

- **Framework**: Ionic React 8
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Internationalization**: i18next
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Mobile**: Capacitor (Android/iOS)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

The project has comprehensive test coverage with both unit tests and end-to-end tests.

### Unit Tests

Unit tests are written with Vitest and achieve **83.6% code coverage**.

```bash
# Run unit tests
npm run test.unit

# Run with coverage report
npm run test.unit -- --coverage

# Run in watch mode
npm run test.unit -- --watch
```

**Coverage Summary:**

| Category   | Coverage |
|------------|----------|
| Statements | 83.6%    |
| Branches   | 77.95%   |
| Functions  | 78.12%   |
| Lines      | 83.6%    |

### End-to-End Tests

E2E tests are written with Playwright and cover multiple browsers, devices, and viewports.

```bash
# Run E2E tests (requires running dev server)
npm run test.e2e

# Run E2E tests with UI
npm run test.e2e -- --ui

# Run specific test file
npm run test.e2e -- e2e/auth.spec.ts

# Run on specific device
npm run test.e2e -- --project="Mobile Chrome (Pixel 5)"
```

#### Test Credentials

E2E tests use credentials from `.env` file:

```env
TEST_USERNAME=demo
TEST_PASSWORD=demo
```

#### Browser & Device Coverage

The E2E test suite runs on **12 different configurations**:

**Mobile Devices (Android):**

- Pixel 5 (Chrome)
- Pixel 7 (Chrome)
- Galaxy S9+ (Chrome)
- Galaxy S23 (Chrome)

**Mobile Devices (iOS):**

- iPhone 12 (Safari)
- iPhone 14 (Safari)
- iPhone SE (Safari)

**Desktop Browsers:**

- Chrome (1280x720)
- Firefox (1280x720)

**Custom Viewports:**

- Small Mobile (320x568)
- Large Mobile (428x926)
- Small Tablet (768x1024)

#### E2E Test Suites

| Suite                   | Tests | Description                        |
|-------------------------|-------|------------------------------------|
| `auth.spec.ts`          | 11    | Login, logout, protected routes    |
| `results.spec.ts`       | 14    | Results listing, filtering, details|
| `patients.spec.ts`      | 8     | Patient list, search, details      |
| `laboratories.spec.ts`  | 9     | Laboratory directory               |
| `news.spec.ts`          | 7     | News articles                      |
| `settings.spec.ts`      | 12    | Settings, profile, preferences     |
| `responsive.spec.ts`    | 14    | Responsive design, navigation      |
| `pdf-export.spec.ts`    | 6     | PDF export/download functionality  |
| `offline-mode.spec.ts`  | 14    | PWA offline capabilities           |

Total: ~95 E2E tests across 12 device configurations

### Run All Tests

```bash
# Unit tests
npm run test.unit

# E2E tests (start dev server first)
npm run dev
npm run test.e2e
```

## Project Structure

```text
src/
├── api/                  # API client and types
│   ├── client/          # Axios client configuration
│   ├── hooks/           # React Query hooks
│   ├── mocks/           # Mock data for testing
│   └── types/           # TypeScript types for API
├── config/              # App configuration
│   └── routes.ts        # Route definitions
├── features/            # Feature modules
│   ├── auth/           # Authentication
│   ├── help/           # Help & About pages
│   ├── laboratories/   # Laboratory directory
│   ├── news/           # News articles
│   ├── patients/       # Patient management
│   ├── results/        # Lab results
│   └── settings/       # App settings
├── shared/              # Shared utilities
│   ├── components/     # Reusable components
│   ├── hooks/          # Shared hooks
│   ├── store/          # Zustand stores
│   └── utils/          # Utility functions
└── App.tsx              # Main app component

e2e/                     # Playwright E2E tests
├── helpers/            # Test helpers (auth, utils)
└── *.spec.ts           # Test files
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=https://demo.labgate.net

# Test Credentials (for E2E tests)
TEST_USERNAME=demo
TEST_PASSWORD=demo
```

## Mobile Development

### Android

```bash
npm run build
npx cap sync android
npx cap open android
```

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
```

## PWA Features

The app is a fully-featured Progressive Web App with:

- **Service Worker**: Caches app shell and assets for offline use
- **Offline Support**: View cached results without internet
- **Install Prompt**: Can be installed on mobile devices
- **Background Sync**: Queues actions while offline

## API

The app connects to the labGate API v3. See [API Documentation](docs/v3.json) for details.

## License

Copyright 2026 labGate GmbH. All rights reserved.

Medical device Class I according to MDR (EU) 2017/745.
