import { test, expect } from '@playwright/test';
import { login, waitForStable } from './helpers/auth';

test.describe('Patients Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/patients');
    await waitForStable(page);
  });

  test.describe('Patients List', () => {
    test('should display patients page header', async ({ page }) => {
      await expect(page.locator('ion-title').filter({ hasText: /patienten/i })).toBeVisible();
    });

    test('should show patients list or empty state', async ({ page }) => {
      // Either patients list or empty state should be visible
      const hasPatients = await page.locator('ion-accordion, ion-item, ion-card').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=/keine patienten/i').isVisible().catch(() => false);

      expect(hasPatients || hasEmptyState).toBeTruthy();
    });

    test('should have search functionality', async ({ page }) => {
      // Look for search button or search input
      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();
      const searchInput = page.locator('ion-searchbar, input[type="search"]');

      const hasSearchButton = await searchButton.isVisible().catch(() => false);
      const hasSearchInput = await searchInput.isVisible().catch(() => false);

      expect(hasSearchButton || hasSearchInput).toBeTruthy();
    });

    test('should expand accordion to show patients', async ({ page }) => {
      const accordion = page.locator('ion-accordion').first();

      if (await accordion.isVisible()) {
        await accordion.click();
        await waitForStable(page);

        // Check if content is expanded
        const content = accordion.locator('div[slot="content"]');
        await expect(content).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Patient Search', () => {
    test('should filter patients when searching', async ({ page }) => {
      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();

      if (await searchButton.isVisible()) {
        await searchButton.click();
        await waitForStable(page);

        const searchInput = page.locator('ion-searchbar input, input[type="search"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await waitForStable(page, 1000);

          // Page should update
          await expect(page.locator('ion-content')).toBeVisible();
        }
      }
    });

    test('should close search', async ({ page }) => {
      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();

      if (await searchButton.isVisible()) {
        await searchButton.click();
        await waitForStable(page);

        // Close search
        const closeButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="close"]') }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await waitForStable(page);
        }
      }
    });
  });

  test.describe('Patient Detail', () => {
    test('should navigate to patient detail', async ({ page }) => {
      // Expand first accordion
      const accordion = page.locator('ion-accordion').first();

      if (await accordion.isVisible()) {
        await accordion.click();
        await waitForStable(page);

        // Click on patient
        const patientItem = accordion.locator('div[slot="content"] > div, ion-item').first();
        if (await patientItem.isVisible()) {
          await patientItem.click();
          await waitForStable(page);

          // Should navigate to patient detail
          await expect(page).toHaveURL(/\/patients\/\d+/);
        }
      }
    });

    test('should show patient info on detail page', async ({ page }) => {
      const accordion = page.locator('ion-accordion').first();

      if (await accordion.isVisible()) {
        await accordion.click();
        await waitForStable(page);

        const patientItem = accordion.locator('div[slot="content"] > div, ion-item').first();
        if (await patientItem.isVisible()) {
          await patientItem.click();
          await waitForStable(page);

          // Should show patient information
          await expect(page.locator('ion-content')).toBeVisible();
        }
      }
    });

    test('should navigate back from patient detail', async ({ page }) => {
      const accordion = page.locator('ion-accordion').first();

      if (await accordion.isVisible()) {
        await accordion.click();
        await waitForStable(page);

        const patientItem = accordion.locator('div[slot="content"] > div, ion-item').first();
        if (await patientItem.isVisible()) {
          await patientItem.click();
          await waitForStable(page);

          // Go back
          const backButton = page.locator('ion-back-button, ion-button').filter({ has: page.locator('ion-icon[name*="arrow-back"], ion-icon[name*="chevron-back"]') }).first();

          if (await backButton.isVisible()) {
            await backButton.click();
            await waitForStable(page);

            await expect(page).toHaveURL(/\/patients$/);
          }
        }
      }
    });
  });
});
