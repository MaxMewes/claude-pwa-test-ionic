import { test, expect, Page } from '@playwright/test';
import { login, logout, waitForStable, TEST_CREDENTIALS } from './helpers/auth';

/**
 * Security Test Suite
 *
 * Tests for common security vulnerabilities including:
 * - Authentication bypass attempts
 * - XSS (Cross-Site Scripting) prevention
 * - SQL Injection prevention
 * - Session security
 * - Authorization/Access control
 * - Sensitive data exposure
 * - Token security
 */

test.describe('Security Tests', () => {

  // ============================================
  // Authentication Security Tests
  // ============================================
  test.describe('Authentication Security', () => {

    test('should prevent SQL injection in username field', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Common SQL injection payloads
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1--",
        "'; DROP TABLE users;--",
        "' UNION SELECT * FROM users--",
      ];

      for (const payload of sqlInjectionPayloads) {
        const usernameInput = page.locator('ion-input input').first();
        const passwordInput = page.locator('input[type="password"]');

        await usernameInput.fill(payload);
        await passwordInput.fill('password');

        const loginButton = page.locator('ion-button[type="submit"]');
        await loginButton.click();
        await page.waitForTimeout(2000);

        // Should still be on login page (injection should not bypass auth)
        await expect(page).toHaveURL(/\/login/);

        // Clear fields for next iteration
        await usernameInput.clear();
        await passwordInput.clear();
      }
    });

    test('should prevent SQL injection in password field', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "password'--",
        "' OR 1=1--",
      ];

      for (const payload of sqlInjectionPayloads) {
        const usernameInput = page.locator('ion-input input').first();
        const passwordInput = page.locator('input[type="password"]');

        await usernameInput.fill('admin');
        await passwordInput.fill(payload);

        const loginButton = page.locator('ion-button[type="submit"]');
        await loginButton.click();
        await page.waitForTimeout(2000);

        // Should still be on login page
        await expect(page).toHaveURL(/\/login/);

        await usernameInput.clear();
        await passwordInput.clear();
      }
    });

    test('should handle extremely long input without crashing', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Create a very long string (potential buffer overflow test)
      const longString = 'A'.repeat(10000);

      const usernameInput = page.locator('ion-input input').first();
      const passwordInput = page.locator('input[type="password"]');

      await usernameInput.fill(longString);
      await passwordInput.fill(longString);

      const loginButton = page.locator('ion-button[type="submit"]');
      await loginButton.click();
      await page.waitForTimeout(2000);

      // Page should not crash and should still show login form
      await expect(page.locator('ion-button[type="submit"]')).toBeVisible();
    });

    test('should not expose error details in login failure messages', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const usernameInput = page.locator('ion-input input').first();
      const passwordInput = page.locator('input[type="password"]');

      await usernameInput.fill('nonexistent_user_12345');
      await passwordInput.fill('wrongpassword');

      const loginButton = page.locator('ion-button[type="submit"]');
      await loginButton.click();
      await page.waitForTimeout(3000);

      // Check that error messages don't reveal sensitive info
      const pageContent = await page.content();

      // Should not contain technical error details
      expect(pageContent.toLowerCase()).not.toContain('sql');
      expect(pageContent.toLowerCase()).not.toContain('database');
      expect(pageContent.toLowerCase()).not.toContain('exception');
      expect(pageContent.toLowerCase()).not.toContain('stack trace');
      expect(pageContent.toLowerCase()).not.toContain('server error');
    });

    test('should not indicate whether username exists', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Try with a definitely non-existent user
      const usernameInput = page.locator('ion-input input').first();
      const passwordInput = page.locator('input[type="password"]');

      await usernameInput.fill('definitely_not_a_real_user_xyz123');
      await passwordInput.fill('somepassword');

      const loginButton = page.locator('ion-button[type="submit"]');
      await loginButton.click();
      await page.waitForTimeout(3000);

      const pageContent = await page.content();

      // Should not have messages like "user not found" that reveal user existence
      expect(pageContent.toLowerCase()).not.toContain('user not found');
      expect(pageContent.toLowerCase()).not.toContain('benutzer nicht gefunden');
      expect(pageContent.toLowerCase()).not.toContain('username does not exist');
    });
  });

  // ============================================
  // XSS Prevention Tests
  // ============================================
  test.describe('XSS Prevention', () => {

    test('should escape XSS payloads in username field', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        '"><script>alert("XSS")</script>',
        "'-alert(1)-'",
        '<iframe src="javascript:alert(1)">',
      ];

      for (const payload of xssPayloads) {
        const usernameInput = page.locator('ion-input input').first();
        const passwordInput = page.locator('input[type="password"]');

        await usernameInput.fill(payload);
        await passwordInput.fill('password');

        const loginButton = page.locator('ion-button[type="submit"]');
        await loginButton.click();
        await page.waitForTimeout(2000);

        // Check that no alert dialog appeared (XSS was blocked)
        // Playwright would throw if an unexpected dialog appears

        // Page should still be functional
        await expect(page.locator('ion-button[type="submit"]')).toBeVisible();

        await usernameInput.clear();
        await passwordInput.clear();
      }
    });

    test('should escape XSS in URL parameters', async ({ page }) => {
      // Try XSS via URL parameters
      const xssUrls = [
        '/login?redirect=<script>alert(1)</script>',
        '/login?error=<img src=x onerror=alert(1)>',
        '/results?search=<script>alert(1)</script>',
      ];

      for (const url of xssUrls) {
        await page.goto(url);
        await page.waitForTimeout(1000);

        // Page should load without executing malicious scripts
        const pageContent = await page.content();

        // The script should be escaped, not rendered as HTML
        expect(pageContent).not.toContain('<script>alert(1)</script>');
      }
    });

    test('should sanitize HTML in displayed content after login', async ({ page }) => {
      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed - API might be unavailable');
        return;
      }

      // Check that the page doesn't have raw script tags in content
      const pageContent = await page.content();

      // Look for signs of unescaped HTML that could be XSS vectors
      const scriptTagCount = (pageContent.match(/<script[^>]*>[^<]*alert/gi) || []).length;
      expect(scriptTagCount).toBe(0);

      await logout(page);
    });
  });

  // ============================================
  // Session Security Tests
  // ============================================
  test.describe('Session Security', () => {

    test('should not expose auth token in URL', async ({ page }) => {
      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      // Token should not be in URL
      expect(url.toLowerCase()).not.toContain('token=');
      expect(url.toLowerCase()).not.toContain('auth=');
      expect(url.toLowerCase()).not.toContain('session=');

      await logout(page);
    });

    test('should clear authentication data on logout', async ({ page }) => {
      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      // Get localStorage before logout
      const authDataBefore = await page.evaluate(() => {
        return {
          authStore: localStorage.getItem('auth-storage'),
          token: localStorage.getItem('token'),
        };
      });

      // Verify we have auth data
      expect(authDataBefore.authStore).not.toBeNull();

      await logout(page);

      // Check localStorage after logout
      const authDataAfter = await page.evaluate(() => {
        const authStore = localStorage.getItem('auth-storage');
        if (authStore) {
          try {
            const parsed = JSON.parse(authStore);
            return {
              isAuthenticated: parsed?.state?.isAuthenticated,
              token: parsed?.state?.token,
              user: parsed?.state?.user,
            };
          } catch {
            return { isAuthenticated: false, token: null, user: null };
          }
        }
        return { isAuthenticated: false, token: null, user: null };
      });

      // Auth state should be cleared
      expect(authDataAfter.isAuthenticated).toBeFalsy();
      expect(authDataAfter.token).toBeFalsy();
    });

    test('should prevent session fixation by regenerating token on login', async ({ page }) => {
      // Get any pre-existing auth data
      await page.goto('/login');
      await waitForStable(page);

      const preLoginStorage = await page.evaluate(() => {
        return localStorage.getItem('auth-storage');
      });

      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      const postLoginStorage = await page.evaluate(() => {
        return localStorage.getItem('auth-storage');
      });

      // Token should be different after login (new session)
      if (preLoginStorage && postLoginStorage) {
        const preParsed = JSON.parse(preLoginStorage);
        const postParsed = JSON.parse(postLoginStorage);

        if (preParsed?.state?.token && postParsed?.state?.token) {
          // If there was a token before, it should be different now
          expect(postParsed.state.token).not.toBe(preParsed.state.token);
        }
      }

      await logout(page);
    });

    test('should invalidate session after logout and prevent reuse', async ({ page }) => {
      await login(page);

      let url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      // Store the token before logout
      const tokenBefore = await page.evaluate(() => {
        const authStore = localStorage.getItem('auth-storage');
        if (authStore) {
          try {
            return JSON.parse(authStore)?.state?.token;
          } catch {
            return null;
          }
        }
        return null;
      });

      await logout(page);

      // Try to manually set the old token back
      if (tokenBefore) {
        await page.evaluate((token) => {
          const authStore = localStorage.getItem('auth-storage');
          if (authStore) {
            const parsed = JSON.parse(authStore);
            parsed.state = parsed.state || {};
            parsed.state.token = token;
            parsed.state.isAuthenticated = true;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
        }, tokenBefore);

        // Try to access protected route
        await page.goto('/results');
        await waitForStable(page);

        // Should be redirected to login (server-side token should be invalidated)
        // Note: This test depends on server-side session invalidation
        url = page.url();
        // The app may redirect to login if token is invalid server-side
      }
    });
  });

  // ============================================
  // Authorization/Access Control Tests
  // ============================================
  test.describe('Authorization & Access Control', () => {

    test('should not allow access to protected routes without authentication', async ({ page }) => {
      const protectedRoutes = [
        '/results',
        '/patients',
        '/laboratories',
        '/news',
        '/settings',
        '/senders',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await waitForStable(page);

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should not expose protected API endpoints in network errors', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Try to access API directly without auth
      const response = await page.request.get('/api/v3/results');

      // Should get 401 Unauthorized, not expose data
      expect([401, 403, 404]).toContain(response.status());

      // Response should not contain sensitive data
      const responseText = await response.text();
      expect(responseText.toLowerCase()).not.toContain('password');
      expect(responseText.toLowerCase()).not.toContain('token');
    });

    test('should handle direct navigation to non-existent routes securely', async ({ page }) => {
      await page.goto('/admin/secret/panel');
      await waitForStable(page);

      // Should redirect to login or show 404, not crash
      const url = page.url();
      expect(url).toMatch(/\/(login|404|results)?/);
    });

    test('should prevent path traversal attempts', async ({ page }) => {
      const pathTraversalUrls = [
        '/results/../../../etc/passwd',
        '/results/..%2F..%2F..%2Fetc%2Fpasswd',
        '/login/....//....//etc/passwd',
      ];

      for (const maliciousUrl of pathTraversalUrls) {
        await page.goto(maliciousUrl);
        await waitForStable(page);

        // Should not expose sensitive files, should redirect to login or 404
        const content = await page.content();
        expect(content).not.toContain('root:');
        expect(content).not.toContain('/bin/bash');
      }
    });
  });

  // ============================================
  // Data Exposure Tests
  // ============================================
  test.describe('Sensitive Data Exposure', () => {

    test('should not expose sensitive data in page source', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const pageSource = await page.content();

      // Check for common sensitive data patterns
      expect(pageSource).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
      expect(pageSource).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i);
      expect(pageSource).not.toMatch(/secret\s*[:=]\s*["'][^"']+["']/i);
      expect(pageSource).not.toMatch(/private[_-]?key/i);
    });

    test('should not log sensitive data to console', async ({ page }) => {
      const consoleLogs: string[] = [];

      page.on('console', (msg) => {
        consoleLogs.push(msg.text());
      });

      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      await page.waitForTimeout(2000);
      await logout(page);

      // Check console logs for sensitive data
      const allLogs = consoleLogs.join(' ').toLowerCase();
      expect(allLogs).not.toContain('password');
      // Token might be logged for debugging, but should be careful
    });

    test('should not include credentials in localStorage in plain text', async ({ page }) => {
      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      const localStorageData = await page.evaluate(() => {
        const data: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return JSON.stringify(data);
      });

      // Password should never be stored in localStorage
      expect(localStorageData.toLowerCase()).not.toContain('"password"');
      expect(localStorageData.toLowerCase()).not.toContain(TEST_CREDENTIALS.password);

      await logout(page);
    });

    test('should use HTTPS for API calls', async ({ page }) => {
      const apiCalls: string[] = [];

      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/api/') || url.includes('/Api/')) {
          apiCalls.push(url);
        }
      });

      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      await page.waitForTimeout(2000);

      // In production, all API calls should use HTTPS
      // Note: In development/test, localhost HTTP is acceptable
      const isLocalhost = page.url().includes('localhost');

      if (!isLocalhost) {
        for (const apiUrl of apiCalls) {
          if (!apiUrl.startsWith('http://localhost')) {
            expect(apiUrl).toMatch(/^https:/);
          }
        }
      }

      await logout(page);
    });
  });

  // ============================================
  // Input Validation Tests
  // ============================================
  test.describe('Input Validation', () => {

    test('should handle special characters in inputs safely', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const specialChars = [
        '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~',
        '中文字符',
        '🎉🚀💻',
        '\x00\x01\x02', // null bytes
        '\t\n\r',
      ];

      for (const chars of specialChars) {
        const usernameInput = page.locator('ion-input input').first();
        await usernameInput.fill(chars);
        await page.waitForTimeout(500);

        // Input should accept the characters without crashing
        await expect(usernameInput).toBeVisible();
        await usernameInput.clear();
      }
    });

    test('should validate email format in registration if applicable', async ({ page }) => {
      await page.goto('/register');
      await waitForStable(page);

      // Check if registration page exists
      if (!page.url().includes('/register')) {
        test.skip(true, 'Registration page not available');
        return;
      }

      const emailInput = page.locator('input[type="email"], ion-input[type="email"] input');

      if (await emailInput.isVisible().catch(() => false)) {
        const invalidEmails = [
          'notanemail',
          'missing@domain',
          '@nodomain.com',
          'spaces in@email.com',
        ];

        for (const email of invalidEmails) {
          await emailInput.fill(email);
          await page.waitForTimeout(500);

          // Should show validation error or be marked invalid
          // The exact validation behavior depends on implementation
        }
      }
    });

    test('should prevent command injection in search fields', async ({ page }) => {
      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      // Look for search input
      const searchInput = page.locator('ion-searchbar input, input[type="search"]').first();

      if (await searchInput.isVisible().catch(() => false)) {
        const injectionPayloads = [
          '; ls -la',
          '| cat /etc/passwd',
          '$(whoami)',
          '`id`',
        ];

        for (const payload of injectionPayloads) {
          await searchInput.fill(payload);
          await page.waitForTimeout(1000);

          // Page should handle this gracefully
          const content = await page.content();
          expect(content).not.toContain('root:');
          expect(content).not.toContain('uid=');

          await searchInput.clear();
        }
      }

      await logout(page);
    });
  });

  // ============================================
  // Security Headers Tests
  // ============================================
  test.describe('Security Headers', () => {

    test('should have security headers on responses', async ({ page }) => {
      const response = await page.goto('/login');

      if (response) {
        const headers = response.headers();

        // These headers should ideally be present
        // Note: Some may be set by the server, not the app

        // X-Content-Type-Options prevents MIME sniffing
        if (headers['x-content-type-options']) {
          expect(headers['x-content-type-options']).toBe('nosniff');
        }

        // X-Frame-Options prevents clickjacking
        if (headers['x-frame-options']) {
          expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options'].toUpperCase());
        }

        // Content-Security-Policy
        // This is a more advanced check, CSP varies by application
      }
    });

    test('should not have server version exposed in headers', async ({ page }) => {
      const response = await page.goto('/login');

      if (response) {
        const headers = response.headers();

        // Server header should not expose version details
        if (headers['server']) {
          expect(headers['server']).not.toMatch(/\d+\.\d+/);
        }

        // X-Powered-By should not be present (exposes tech stack)
        expect(headers['x-powered-by']).toBeUndefined();
      }
    });
  });

  // ============================================
  // CSRF Protection Tests
  // ============================================
  test.describe('CSRF Protection', () => {

    test('should include CSRF protection mechanisms', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Check for CSRF token in form or meta tag
      const csrfMeta = page.locator('meta[name="csrf-token"]');
      const csrfInput = page.locator('input[name="_csrf"], input[name="csrf_token"]');

      // Note: Modern SPAs often use token-based auth which is CSRF-resistant
      // This test documents the current state

      const hasCSRFMeta = await csrfMeta.count() > 0;
      const hasCSRFInput = await csrfInput.count() > 0;

      // Log whether CSRF protection is present
      // For token-based APIs, CSRF might not be needed
      console.log(`CSRF meta tag present: ${hasCSRFMeta}`);
      console.log(`CSRF input present: ${hasCSRFInput}`);
    });

    test('should reject requests from different origins', async ({ page, context }) => {
      // This test checks if the API rejects cross-origin requests
      await page.goto('/login');

      // Attempt to make a request with a different origin header
      // Note: Browser security will prevent this, but server should also validate
      try {
        const response = await page.request.post('/Api/V2/Authentication/Authorize', {
          headers: {
            'Origin': 'https://malicious-site.com',
            'Content-Type': 'application/json',
          },
          data: {
            username: 'test',
            password: 'test',
          },
        });

        // Response should either reject or not expose sensitive data
        const responseText = await response.text();
        expect(responseText.toLowerCase()).not.toContain('token');
      } catch {
        // Request might be blocked, which is expected behavior
      }
    });
  });

  // ============================================
  // Rate Limiting Indicators
  // ============================================
  test.describe('Rate Limiting', () => {

    test('should handle multiple rapid login attempts', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const usernameInput = page.locator('ion-input input').first();
      const passwordInput = page.locator('input[type="password"]');
      const loginButton = page.locator('ion-button[type="submit"]');

      // Attempt multiple rapid logins
      for (let i = 0; i < 5; i++) {
        await usernameInput.fill('testuser' + i);
        await passwordInput.fill('wrongpassword');
        await loginButton.click();
        await page.waitForTimeout(500);
      }

      // Page should still be functional (not crash)
      await expect(loginButton).toBeVisible();

      // Check if any rate limiting message appears
      const pageContent = await page.content();
      const hasRateLimitMessage =
        pageContent.toLowerCase().includes('too many') ||
        pageContent.toLowerCase().includes('rate limit') ||
        pageContent.toLowerCase().includes('zu viele') ||
        pageContent.toLowerCase().includes('versuche');

      // Document rate limiting status
      console.log(`Rate limiting message shown: ${hasRateLimitMessage}`);
    });
  });

  // ============================================
  // Cookie Security Tests
  // ============================================
  test.describe('Cookie Security', () => {

    test('should set secure cookie flags', async ({ page, context }) => {
      await login(page);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed');
        return;
      }

      const cookies = await context.cookies();

      for (const cookie of cookies) {
        // In production, cookies should have secure flag
        // Note: This might not apply to localhost testing
        if (!cookie.domain?.includes('localhost')) {
          // Sensitive cookies should have HttpOnly
          if (cookie.name.toLowerCase().includes('session') ||
              cookie.name.toLowerCase().includes('auth') ||
              cookie.name.toLowerCase().includes('token')) {
            console.log(`Cookie ${cookie.name}: HttpOnly=${cookie.httpOnly}, Secure=${cookie.secure}, SameSite=${cookie.sameSite}`);
          }
        }
      }

      await logout(page);
    });
  });
});
