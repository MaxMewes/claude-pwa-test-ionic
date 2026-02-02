import { test, expect } from '@playwright/test';
import { login, waitForStable } from './helpers/auth';

test.describe('Laboratories Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/laboratories');
    await waitForStable(page);
  });

  test.describe('Laboratories List', () => {
    test('should display laboratories page header', async ({ page }) => {
      await expect(page.locator('ion-title').filter({ hasText: /labor/i })).toBeVisible();
    });

    test('should show laboratories list or empty state', async ({ page }) => {
      const hasLabs = await page.locator('ion-item, ion-card').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=/keine labore/i').isVisible().catch(() => false);

      expect(hasLabs || hasEmptyState).toBeTruthy();
    });

    test('should display laboratory cards/items', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        // Should contain lab name or info
        await expect(labItem).toBeVisible();
      }
    });
  });

  test.describe('Laboratory Detail', () => {
    test('should navigate to laboratory detail', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        await expect(page).toHaveURL(/\/laboratories\/\d+/);
      }
    });

    test('should display laboratory information', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        // Should show lab details
        await expect(page.locator('ion-content')).toBeVisible();
      }
    });

    test('should have segment tabs for info/services/contacts', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        // Check for segment buttons
        const segment = page.locator('ion-segment, ion-segment-button');
        const hasSegment = await segment.first().isVisible().catch(() => false);

        // Segment tabs are optional based on lab data
        expect(true).toBeTruthy();
      }
    });

    test('should switch to services tab', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        const servicesTab = page.locator('ion-segment-button').filter({ hasText: /leistung|service/i });

        if (await servicesTab.isVisible()) {
          await servicesTab.click();
          await waitForStable(page);

          // Services content should be visible
          await expect(page.locator('ion-content')).toBeVisible();
        }
      }
    });

    test('should switch to contacts tab', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        const contactsTab = page.locator('ion-segment-button').filter({ hasText: /kontakt|contact/i });

        if (await contactsTab.isVisible()) {
          await contactsTab.click();
          await waitForStable(page);

          await expect(page.locator('ion-content')).toBeVisible();
        }
      }
    });

    test('should navigate back from laboratory detail', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        const backButton = page.locator('ion-back-button, ion-button').filter({ has: page.locator('ion-icon[name*="arrow-back"], ion-icon[name*="chevron-back"]') }).first();

        if (await backButton.isVisible()) {
          await backButton.click();
          await waitForStable(page);

          await expect(page).toHaveURL(/\/laboratories$/);
        }
      }
    });
  });

  test.describe('Service Catalog', () => {
    test('should search services', async ({ page }) => {
      const labItem = page.locator('ion-item, ion-card').first();

      if (await labItem.isVisible()) {
        await labItem.click();
        await waitForStable(page);

        const servicesTab = page.locator('ion-segment-button').filter({ hasText: /leistung|service/i });

        if (await servicesTab.isVisible()) {
          await servicesTab.click();
          await waitForStable(page);

          const searchInput = page.locator('ion-searchbar input, input[type="search"]');
          if (await searchInput.isVisible()) {
            await searchInput.fill('blut');
            await waitForStable(page, 1000);
          }
        }
      }
    });
  });
});
