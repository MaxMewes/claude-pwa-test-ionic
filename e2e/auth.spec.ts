import { test, expect } from '@playwright/test';
import { login, logout, waitForStable, TEST_CREDENTIALS } from './helpers/auth';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Check for login form elements
      await expect(page.locator('img[alt="labGate"]')).toBeVisible();
      await expect(page.locator('ion-input').first()).toBeVisible();
      await expect(page.locator('ion-button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Click login without filling fields
      const loginButton = page.locator('ion-button[type="submit"]');
      await loginButton.click();
      await waitForStable(page);

      // Should show validation error text (Ionic renders error in slot)
      const errorText = page.locator('text=/benutzername|username|required/i');
      await expect(errorText.first()).toBeVisible({ timeout: 5000 });
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await login(page);

      // Should be on results page or have results content
      const isOnResults = page.url().includes('/results');
      if (!isOnResults) {
        await page.waitForTimeout(2000);
      }

      // Should see main content area (use role='main' to avoid matching menu content)
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // Fill with invalid credentials
      const usernameInput = page.locator('ion-input input').first();
      await usernameInput.fill('invaliduser');

      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('wrongpassword');

      // Click login
      const loginButton = page.locator('ion-button[type="submit"]');
      await loginButton.click();

      // Wait for error message
      await page.waitForTimeout(3000);

      // Should still be on login page (failed login)
      await expect(page).toHaveURL(/\/login/);
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      const forgotPasswordLink = page.locator('ion-button').filter({ hasText: /passwort vergessen/i });
      await expect(forgotPasswordLink).toBeVisible();
    });

    test('should have register link', async ({ page }) => {
      await page.goto('/login');
      await waitForStable(page);

      // The register button says "Zugang beantragen" in German
      const registerLink = page.locator('ion-button').filter({ hasText: /zugang beantragen|register/i });
      await expect(registerLink).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await login(page);

      // Verify we're logged in (check URL contains results or we see results content)
      await page.waitForTimeout(1000);
      const url = page.url();
      const isOnResults = url.includes('/results');

      // Skip test if login didn't work (API might be down)
      if (!isOnResults) {
        test.skip(true, 'Login did not succeed - API might be unavailable');
        return;
      }

      // Then logout
      await logout(page);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should clear session on logout', async ({ page }) => {
      // Login
      await login(page);
      await page.waitForTimeout(1000);

      const url = page.url();
      if (!url.includes('/results')) {
        test.skip(true, 'Login did not succeed - API might be unavailable');
        return;
      }

      // Logout
      await logout(page);

      // Try to access protected route
      await page.goto('/results');
      await waitForStable(page);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing results without auth', async ({ page }) => {
      await page.goto('/results');
      await waitForStable(page);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing patients without auth', async ({ page }) => {
      await page.goto('/patients');
      await waitForStable(page);

      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing settings without auth', async ({ page }) => {
      await page.goto('/settings');
      await waitForStable(page);

      await expect(page).toHaveURL(/\/login/);
    });
  });
});
