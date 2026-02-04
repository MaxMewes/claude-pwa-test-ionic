# labGate App - Security Documentation

## Content Security Policy (CSP)

### Overview

Content Security Policy (CSP) is a security layer that helps prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks. This document describes the CSP configuration for the labGate PWA.

### CSP Configuration

CSP is configured via HTTP headers in `vite.config.ts` (not via meta tags, as `frame-ancestors` directive is ignored in meta tags).

#### Development CSP

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://demo.labgate.net https://*.labgate.net https://*.vireq.com wss: ws: http://localhost:*;
media-src 'self' blob:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

Development mode requires `'unsafe-inline'` and `'unsafe-eval'` for:
- Vite Hot Module Replacement (HMR)
- React Fast Refresh
- Development tooling

#### Production CSP

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://demo.labgate.net https://*.labgate.net https://*.vireq.com wss:;
media-src 'self' blob:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests;
```

Key differences in production:
- **No `'unsafe-eval'`** for `script-src` - eval() is blocked
- **No `ws:`** - only secure WebSockets (`wss:`) allowed
- **`upgrade-insecure-requests`** - forces HTTPS for all requests

### Ionic Framework CSP Limitation

**Important:** The `style-src` directive includes `'unsafe-inline'` even in production. This is a **known limitation of the Ionic Framework**.

#### Why This Is Required

Ionic Framework is built on [Stencil](https://stenciljs.com/), which uses Web Components. These components dynamically inject styles at runtime:

```javascript
// From Ionic's Stencil runtime (index.js)
addStyle()      // Line ~1233
attachStyles()  // Line ~1284
```

When CSP blocks inline styles, you'll see console errors like:

```
Applying inline style violates the following Content Security Policy directive
'style-src 'self' https://fonts.googleapis.com'. Either the 'unsafe-inline'
keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to
enable inline execution. The action has been blocked.
```

This causes Ionic components to render without their styles, breaking the UI completely.

#### Alternatives Considered

| Approach | Feasibility | Notes |
|----------|-------------|-------|
| Remove `'unsafe-inline'` | Not possible | Ionic components won't render correctly |
| Use nonces | Not possible | Stencil doesn't support CSP nonces |
| Use hashes | Not practical | Hundreds of dynamic style hashes would be needed |
| Fork Ionic | Too costly | Would require maintaining a custom Ionic fork |
| Switch frameworks | Major rewrite | Would require rewriting the entire app |

#### Security Implications

The presence of `'unsafe-inline'` for styles is a **moderate security concern**:

- **XSS via style injection** is possible but less severe than script injection
- **CSS-based attacks** like data exfiltration via `background-image: url()` are theoretically possible
- **Mitigated by**: strict `script-src 'self'` which prevents the most dangerous XSS attacks

This is an accepted trade-off when using Ionic Framework.

#### References

- [Ionic CSP Documentation](https://ionicframework.com/docs/troubleshooting/runtime#content-security-policy)
- [Stencil CSP Issue #2531](https://github.com/ionic-team/stencil/issues/2531)
- [Web Components and CSP](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)

### CSP Directive Reference

| Directive | Purpose | Our Setting |
|-----------|---------|-------------|
| `default-src` | Fallback for other directives | `'self'` |
| `script-src` | JavaScript sources | `'self'` (prod) |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` |
| `font-src` | Font sources | `'self'` + Google Fonts |
| `img-src` | Image sources | `'self' data: https: blob:` |
| `connect-src` | XHR, WebSocket, fetch | API domains + WebSocket |
| `media-src` | Audio/video sources | `'self' blob:` |
| `frame-ancestors` | Who can embed this page | `'none'` (prevents clickjacking) |
| `base-uri` | Restricts `<base>` element | `'self'` |
| `form-action` | Form submission targets | `'self'` |
| `object-src` | Plugin content (Flash, etc.) | `'none'` |
| `upgrade-insecure-requests` | Force HTTPS | Enabled (prod) |

### Additional Security Headers

The following security headers are also configured:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent framing (legacy) |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `camera=(self), microphone=(), geolocation=(self), payment=()` | Browser feature permissions |

---

## Session Storage Security

### Token Storage

Authentication tokens are stored in `sessionStorage` (not `localStorage`):

```typescript
// src/features/auth/store/authStore.ts
storage: createJSONStorage(() => sessionStorage)
```

#### Why sessionStorage?

| Aspect | sessionStorage | localStorage |
|--------|---------------|--------------|
| Persistence | Cleared on browser close | Persists indefinitely |
| Tab isolation | Per-tab storage | Shared across tabs |
| XSS exposure window | Limited to session | Permanent until cleared |

#### What Is Stored

```typescript
partialize: (state) => ({
  user: state.user,           // User profile (non-sensitive)
  token: state.token,         // Auth token
  isAuthenticated: state.isAuthenticated,
  pin: state.pin,             // PIN (see note below)
  biometricEnabled: state.biometricEnabled,
})
```

#### Security Considerations

1. **Token in plain text**: The JWT token is stored in plain text. This is standard practice as:
   - sessionStorage is same-origin protected
   - Token is short-lived and server-validated
   - Encrypting client-side provides no real security benefit

2. **PIN storage**: The PIN is stored in plain text. Consider:
   - Hashing the PIN before storage
   - Or not persisting the PIN at all

3. **Logout behavior**: The `logout()` function properly clears all sensitive data:
   ```typescript
   logout: () => set({
     user: null,
     token: null,
     tempToken: null,
     // ... all auth state cleared
   })
   ```

---

## Production Deployment

When deploying to production, ensure your web server sets the CSP header. Example for nginx:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://demo.labgate.net https://*.labgate.net https://*.vireq.com wss:; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" always;
```

---

## Security Testing

E2E security tests are available in:
- `e2e/security.spec.ts` - General security tests
- `e2e/csp-audit.spec.ts` - CSP header validation

Run with:
```bash
npm run test.e2e
```
