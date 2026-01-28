# labGate App - Entwickler-Dokumentation

## Tech Stack

- **Framework:** Ionic React 8.x
- **Build Tool:** Vite 5.x
- **State Management:** Zustand 5.x
- **Data Fetching:** TanStack React Query 5.x
- **Forms:** React Hook Form 7.x + Zod
- **HTTP Client:** Axios 1.x
- **Charts:** Recharts 2.x
- **i18n:** i18next + react-i18next
- **Date Handling:** date-fns 4.x
- **PWA:** vite-plugin-pwa

## Setup

### Voraussetzungen

- Node.js 18+
- npm 9+

### Installation

```bash
# Repository klonen
cd labgate-pwa

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### Verfuegbare Scripts

```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build erstellen
npm run preview  # Build-Vorschau starten
npm run lint     # Linting ausfuehren
npm run test.unit # Unit-Tests ausfuehren
```

## Projektstruktur

```
src/
├── api/
│   ├── client/
│   │   ├── axiosInstance.ts    # HTTP Client mit Interceptors
│   │   └── mockAdapter.ts      # Mock-API fuer Entwicklung
│   ├── mocks/                  # Mock-Daten
│   │   ├── auth.ts
│   │   ├── results.ts
│   │   ├── patients.ts
│   │   ├── laboratories.ts
│   │   ├── news.ts
│   │   └── settings.ts
│   └── types/
│       └── index.ts            # TypeScript Interfaces
├── features/
│   ├── auth/                   # Authentifizierung
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── store/
│   ├── results/                # Laborbefunde
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── patients/               # Patienten
│   ├── laboratories/           # Labor-Verzeichnis
│   ├── news/                   # Neuigkeiten
│   └── settings/               # Einstellungen
├── shared/
│   ├── components/             # Wiederverwendbare Komponenten
│   ├── hooks/
│   └── utils/
├── config/
│   ├── i18n.ts                 # i18n Konfiguration
│   ├── queryClient.ts          # React Query Konfiguration
│   └── routes.ts               # Route-Definitionen
├── locales/
│   └── de/
│       └── translation.json    # Deutsche Uebersetzungen
├── theme/
│   └── variables.css           # Ionic Theme Variablen
├── App.tsx                     # Haupt-App mit Routing
└── main.tsx                    # Entry Point
```

## Architektur

### Feature-basierte Struktur

Jedes Feature-Modul ist eigenstaendig und enthaelt:
- `pages/` - Seitenkomponenten
- `components/` - Feature-spezifische Komponenten
- `hooks/` - Custom Hooks (Data Fetching, Business Logic)
- `store/` - Zustand Store (falls benoetigt)

### State Management

- **Server State:** TanStack React Query
- **Client State:** Zustand (Auth, UI)
- **Form State:** React Hook Form

### API Layer

Die API-Schicht verwendet Axios mit:
- Request Interceptor fuer Auth Token
- Response Interceptor fuer Token Refresh
- Mock Adapter fuer Entwicklung

## Mock-API

In der Entwicklung wird automatisch ein Mock-Adapter aktiviert:

```typescript
// main.tsx
if (import.meta.env.DEV) {
  setupMockAdapter(axiosInstance);
}
```

### Demo-Zugangsdaten

- **E-Mail:** demo@labgate.de
- **Passwort:** demo123
- **2FA-Code:** 123456

## Komponenten

### Shared Components

| Komponente | Beschreibung |
|------------|--------------|
| `SkeletonLoader` | Lade-Animationen |
| `EmptyState` | Leere Listen-Zustaende |
| `ErrorBoundary` | Fehlerbehandlung |
| `SearchInput` | Such-Eingabe |
| `PasswordInput` | Passwort-Feld mit Toggle |
| `PullToRefresh` | Pull-to-Refresh |

### Feature Components

Siehe jeweilige Feature-Ordner fuer spezifische Komponenten.

## Routing

Die App verwendet Ionic React Router mit:
- Tab-Navigation fuer Hauptbereiche
- Protected Routes fuer authentifizierte Bereiche
- Automatische Weiterleitung zum Login

```typescript
// Geschuetzte Route
<ProtectedRoute path="/results" component={ResultsPage} />
```

## Internationalisierung

Uebersetzungen befinden sich in `src/locales/de/translation.json`.

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
t('results.title'); // "Befunde"
```

## Theming

Ionic Theme Variablen in `src/theme/variables.css`:

- Primary Color: `#0066CC` (Medical Blue)
- Custom Result Colors fuer Flag-Status
- Dark Mode Support

## PWA

Die App ist als PWA konfiguriert mit:
- Service Worker (Workbox)
- Offline-Caching
- App Manifest
- Install-Prompt

## Testing

```bash
npm run test.unit    # Unit Tests (Vitest)
npm run test.e2e     # E2E Tests (Cypress)
```

## Build & Deployment

```bash
# Produktions-Build
npm run build

# Build-Artefakte in ./dist/
```

## Capacitor (Native)

Fuer native Apps:

```bash
# iOS
npx cap add ios
npx cap open ios

# Android
npx cap add android
npx cap open android
```

## Umgebungsvariablen

```bash
# .env
VITE_API_URL=https://api.labgate.de
```

## Weiterentwicklung

### Echte API anbinden

1. Mock-Adapter in Produktion deaktivieren
2. API-URL in `.env` setzen
3. API-Typen ggf. anpassen

### Neue Features hinzufuegen

1. Feature-Ordner unter `src/features/` erstellen
2. Komponenten, Hooks, Pages anlegen
3. Route in `App.tsx` hinzufuegen
4. Tab-Button ggf. hinzufuegen
