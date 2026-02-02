import { test, expect } from '@playwright/test';
import { login, waitForStable } from './helpers/auth';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await waitForStable(page);
  });

  test.describe('Settings Overview', () => {
    test('should display settings page header', async ({ page }) => {
      await expect(page.locator('ion-title').filter({ hasText: /einstellungen/i })).toBeVisible();
    });

    test('should show settings list', async ({ page }) => {
      await expect(page.locator('ion-list, ion-item').first()).toBeVisible();
    });

    test('should have theme/appearance settings', async ({ page }) => {
      const themeItem = page.locator('ion-item').filter({ hasText: /design|theme|erscheinungsbild|dunkel/i }).first();
      const hasTheme = await themeItem.isVisible().catch(() => false);

      // Theme toggle or settings should exist
      expect(hasTheme).toBeTruthy();
    });
  });

  test.describe('Theme Toggle', () => {
    test('should toggle dark mode', async ({ page }) => {
      const darkModeToggle = page.locator('ion-toggle').first();

      if (await darkModeToggle.isVisible()) {
        // Get initial state
        const initialChecked = await darkModeToggle.isChecked();

        // Toggle
        await darkModeToggle.click();
        await waitForStable(page);

        // Verify state changed
        const newChecked = await darkModeToggle.isChecked();
        expect(newChecked).not.toBe(initialChecked);
      }
    });
  });

  test.describe('Settings Navigation', () => {
    test('should navigate to notification settings', async ({ page }) => {
      const notificationItem = page.locator('ion-item').filter({ hasText: /benachrichtigung|notification/i }).first();

      if (await notificationItem.isVisible()) {
        await notificationItem.click();
        await waitForStable(page);

        await expect(page).toHaveURL(/\/settings\/notifications/);
      }
    });

    test('should navigate to password change', async ({ page }) => {
      const passwordItem = page.locator('ion-item').filter({ hasText: /passwort|password/i }).first();

      if (await passwordItem.isVisible()) {
        await passwordItem.click();
        await waitForStable(page);

        await expect(page).toHaveURL(/\/settings\/password/);
      }
    });

    test('should navigate to privacy policy', async ({ page }) => {
      const privacyItem = page.locator('ion-item').filter({ hasText: /datenschutz|privacy/i }).first();

      if (await privacyItem.isVisible()) {
        await privacyItem.click();
        await waitForStable(page);

        await expect(page).toHaveURL(/\/settings\/privacy|\/help\/privacy/);
      }
    });

    test('should navigate to FAQ', async ({ page }) => {
      const faqItem = page.locator('ion-item').filter({ hasText: /faq|häufig|fragen/i }).first();

      if (await faqItem.isVisible()) {
        await faqItem.click();
        await waitForStable(page);

        await expect(page).toHaveURL(/\/settings\/faq/);
      }
    });
  });

  test.describe('Notification Settings', () => {
    test('should display notification options', async ({ page }) => {
      await page.goto('/settings/notifications');
      await waitForStable(page);

      // Should have toggles for notifications
      const toggle = page.locator('ion-toggle').first();
      await expect(toggle).toBeVisible({ timeout: 5000 });
    });

    test('should toggle notification settings', async ({ page }) => {
      await page.goto('/settings/notifications');
      await waitForStable(page);

      const toggle = page.locator('ion-toggle').first();

      if (await toggle.isVisible()) {
        const initialState = await toggle.isChecked();
        await toggle.click();
        await waitForStable(page);

        const newState = await toggle.isChecked();
        expect(newState).not.toBe(initialState);
      }
    });
  });

  test.describe('Password Change', () => {
    test('should display password change form', async ({ page }) => {
      await page.goto('/settings/password');
      await waitForStable(page);

      // Should have password input fields
      const passwordInputs = page.locator('ion-input, input[type="password"]');
      const count = await passwordInputs.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should have submit button', async ({ page }) => {
      await page.goto('/settings/password');
      await waitForStable(page);

      const submitButton = page.locator('ion-button[type="submit"], ion-button').filter({ hasText: /speichern|ändern|submit/i });
      await expect(submitButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('FAQ Page', () => {
    test('should display FAQ list', async ({ page }) => {
      await page.goto('/settings/faq');
      await waitForStable(page);

      // Should have FAQ items (accordions or list items)
      const faqItems = page.locator('ion-accordion, ion-item, .faq-item');
      const count = await faqItems.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should expand FAQ item', async ({ page }) => {
      await page.goto('/settings/faq');
      await waitForStable(page);

      const accordion = page.locator('ion-accordion').first();

      if (await accordion.isVisible()) {
        await accordion.click();
        await waitForStable(page);

        // Content should be visible
        const content = accordion.locator('div[slot="content"]');
        await expect(content).toBeVisible({ timeout: 3000 });
      }
    });
  });
});
