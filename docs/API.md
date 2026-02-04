# labGate API Documentation

This document provides an overview of the labGate API endpoints used by the PWA.

## API Versions

The application uses two API versions:

- **API v2** (`/api/v2/` or `/Api/V2/`) - Authentication and legacy endpoints
- **API v3** (`/api/v3/`) - Main data endpoints (RESTful)

## Authentication

All API requests (except login) require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

The token is obtained via the login endpoint and should be stored securely.

---

## API v2 Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/Api/V2/Authentication/Authorize` | Login with username/password |
| POST | `/Api/V2/Authentication/Authorize2F` | Verify two-factor authentication code |
| POST | `/Api/V2/Authentication/Ping` | Check if token is still valid |
| POST | `/Api/V2/Authentication/Logout` | Logout and invalidate token |
| POST | `/Api/V2/Authentication/ChangePassword` | Change user password |
| POST | `/Api/V2/Authentication/ResetPassword` | Request password reset |
| POST | `/Api/V2/Authentication/GetPasswordRules` | Get password complexity rules |
| POST | `/Api/V2/Authentication/SendAccessRequest` | Register new user request |

#### Login Request

```json
POST /Api/V2/Authentication/Authorize
{
  "Username": "string",
  "Password": "string"
}
```

#### Login Response

```json
{
  "Token": "string",
  "PasswordExpired": false,
  "RequiresSecondFactor": false,
  "TwoFactorRegistrationIncomplete": false,
  "Fullname": "string",
  "Firstname": "string",
  "Lastname": "string",
  "Email": "string"
}
```

#### Two-Factor Authentication

```json
POST /Api/V2/Authentication/Authorize2F
{
  "Token": "string",
  "Code": "string"
}
```

### Results (Befunde) - v2

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/Result/GetNewest` | Get newest results |
| POST | `/api/v2/Result/Search` | Search results |
| POST | `/api/v2/Result/GetDetails` | Get result details |
| POST | `/api/v2/Result/GetValueTrend` | Get value trend for a specific test |
| POST | `/api/v2/Result/GetNotificationInfo` | Get notification info |
| POST | `/api/v2/Result/SetConfirmed` | Confirm a result |
| POST | `/api/v2/Result/SetReadStateById` | Mark result as read/unread |
| POST | `/api/v2/Result/SetArchivedStateById` | Archive/unarchive result |

---

## API v3 Endpoints

API v3 follows RESTful conventions with GET/POST/PATCH/DELETE methods.

### Results (Befunde)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/results` | List results with pagination |
| GET | `/api/v3/results/{id}` | Get single result details |
| GET | `/api/v3/results/counter` | Get result counts (total, unread, pathological) |
| PATCH | `/api/v3/results/mark-as-read` | Mark results as read |
| PATCH | `/api/v3/results/mark-as-unread` | Mark results as unread |
| PATCH | `/api/v3/results/mark-as-favorite` | Add to favorites |
| PATCH | `/api/v3/results/mark-as-not-favorite` | Remove from favorites |
| PATCH | `/api/v3/results/mark-as-archived` | Archive results |
| PATCH | `/api/v3/results/mark-as-not-archived` | Unarchive results |
| PATCH | `/api/v3/results/{id}/pin` | Pin a result |

#### List Results

```
GET /api/v3/results?CurrentPage=1&ItemsPerPage=25&Query=search
```

Response:
```json
{
  "Results": [...],
  "TotalCount": 100,
  "CurrentPage": 1,
  "ItemsPerPage": 25,
  "TotalPages": 4
}
```

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/patients` | List patients with pagination |
| GET | `/api/v3/patients/{id}` | Get patient details |

### Laboratories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/laboratories` | List laboratories |
| GET | `/api/v3/laboratories/{id}` | Get laboratory details |

### Senders (Einsender)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/senders` | List senders |

### News

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/news` | List news articles |

### Requests (Leistungsverzeichnis)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v3/requests` | Get service catalog for a laboratory |
| GET | `/api/v3/requests/{id}` | Get request details |

---

## Pagination

All list endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `CurrentPage` | integer | 1 | Current page number |
| `ItemsPerPage` | integer | 25 | Items per page |
| `Query` | string | - | Search/filter string |

Response includes pagination metadata:

```json
{
  "Results": [...],
  "TotalCount": 100,
  "CurrentPage": 1,
  "ItemsPerPage": 25,
  "TotalPages": 4
}
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | No authentication token provided |
| 403 | Invalid or expired token |
| 404 | Resource not found |

---

## Swagger Specifications

Full OpenAPI/Swagger specifications are available:

- [API v2 Specification](v2.json) - Authentication and legacy endpoints
- [API v3 Specification](v3.json) - Main data endpoints

---

## Development

### Demo Server

For development and testing, use the demo server:

```
https://demo.labgate.net
```

### Proxy Configuration

The Vite dev server proxies API requests to avoid CORS issues:

```typescript
// vite.config.ts
proxy: {
  '/api/v3': {
    target: 'https://demo.labgate.net',
    changeOrigin: true,
  },
  '/Api/V2': {
    target: 'https://demo.labgate.net',
    changeOrigin: true,
  },
}
```
