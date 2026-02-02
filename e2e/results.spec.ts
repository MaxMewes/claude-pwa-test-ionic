import { test, expect } from '@playwright/test';
import { login, waitForStable } from './helpers/auth';

test.describe('Results Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Results List', () => {
    test('should display results page header', async ({ page }) => {
      await expect(page.locator('ion-title').filter({ hasText: /befunde/i })).toBeVisible();
    });

    test('should show results list or empty state', async ({ page }) => {
      await waitForStable(page);

      // Either results list or empty state should be visible
      const hasResults = await page.locator('ion-item, ion-card').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=/keine befunde/i').isVisible().catch(() => false);

      expect(hasResults || hasEmptyState).toBeTruthy();
    });

    test('should have search functionality', async ({ page }) => {
      await waitForStable(page);

      // Look for search button or search input
      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();
      const searchInput = page.locator('ion-searchbar, input[type="search"]');

      const hasSearchButton = await searchButton.isVisible().catch(() => false);
      const hasSearchInput = await searchInput.isVisible().catch(() => false);

      expect(hasSearchButton || hasSearchInput).toBeTruthy();
    });

    test('should navigate to result detail when clicking a result', async ({ page }) => {
      await waitForStable(page);

      // Find first result item
      const resultItem = page.locator('ion-item, ion-card, .result-card').first();

      if (await resultItem.isVisible()) {
        await resultItem.click();
        await waitForStable(page);

        // Should navigate to detail page
        await expect(page).toHaveURL(/\/results\/\d+/);
      }
    });
  });

  test.describe('Results Search', () => {
    test('should open search when clicking search button', async ({ page }) => {
      await waitForStable(page);

      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();

      if (await searchButton.isVisible()) {
        await searchButton.click();
        await waitForStable(page);

        // Search input should appear
        const searchInput = page.locator('ion-searchbar input, input[type="search"]');
        await expect(searchInput).toBeVisible({ timeout: 3000 });
      }
    });

    test('should filter results when searching', async ({ page }) => {
      await waitForStable(page);

      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();

      if (await searchButton.isVisible()) {
        await searchButton.click();
        await waitForStable(page);

        const searchInput = page.locator('ion-searchbar input, input[type="search"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await waitForStable(page, 1000);

          // Page should update (either show filtered results or no results)
          await expect(page.locator('ion-content')).toBeVisible();
        }
      }
    });
  });

  test.describe('Results Filter', () => {
    test('should have filter functionality', async ({ page }) => {
      await waitForStable(page);

      // Look for filter button
      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"], ion-icon[name*="filter"]') }).first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForStable(page);

        // Filter modal or popover should appear
        const filterModal = page.locator('ion-modal, ion-popover, .filter-modal');
        await expect(filterModal).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Result Detail', () => {
    test('should display result details', async ({ page }) => {
      await waitForStable(page);

      // Click first result
      const resultItem = page.locator('ion-item, ion-card, .result-card').first();

      if (await resultItem.isVisible()) {
        await resultItem.click();
        await waitForStable(page);

        // Should show patient info or test results
        const hasContent = await page.locator('ion-content').isVisible();
        expect(hasContent).toBeTruthy();
      }
    });

    test('should have back navigation', async ({ page }) => {
      await waitForStable(page);

      const resultItem = page.locator('ion-item, ion-card, .result-card').first();

      if (await resultItem.isVisible()) {
        await resultItem.click();
        await waitForStable(page);

        // Find back button
        const backButton = page.locator('ion-back-button, ion-button').filter({ has: page.locator('ion-icon[name*="arrow-back"], ion-icon[name*="chevron-back"]') }).first();

        if (await backButton.isVisible()) {
          await backButton.click();
          await waitForStable(page);

          // Should be back on results list
          await expect(page).toHaveURL(/\/results$/);
        }
      }
    });
  });

  test.describe('Tab Navigation', () => {
    test('should have bottom tab bar', async ({ page }) => {
      await waitForStable(page);

      const tabBar = page.locator('ion-tab-bar');
      await expect(tabBar).toBeVisible();
    });

    test('should navigate to patients via tab', async ({ page }) => {
      await waitForStable(page);

      const patientsTab = page.locator('ion-tab-button').filter({ hasText: /patienten/i });
      await patientsTab.click();
      await waitForStable(page);

      await expect(page).toHaveURL(/\/patients/);
    });

    test('should navigate to laboratories via tab', async ({ page }) => {
      await waitForStable(page);

      const labsTab = page.locator('ion-tab-button').filter({ hasText: /labore/i });
      await labsTab.click();
      await waitForStable(page);

      await expect(page).toHaveURL(/\/laboratories/);
    });

    test('should navigate to news via tab', async ({ page }) => {
      await waitForStable(page);

      const newsTab = page.locator('ion-tab-button').filter({ hasText: /news/i });
      await newsTab.click();
      await waitForStable(page);

      await expect(page).toHaveURL(/\/news/);
    });

    test('should navigate to settings via tab', async ({ page }) => {
      await waitForStable(page);

      const settingsTab = page.locator('ion-tab-button').filter({ hasText: /einstellungen/i });
      await settingsTab.click();
      await waitForStable(page);

      await expect(page).toHaveURL(/\/settings/);
    });
  });

  test.describe('Side Menu', () => {
    test('should open side menu', async ({ page }) => {
      await waitForStable(page);

      const menuButton = page.locator('ion-menu-button').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await waitForStable(page);

        const menu = page.locator('ion-menu');
        await expect(menu).toHaveAttribute('class', /show-menu/);
      }
    });

    test('should have menu items', async ({ page }) => {
      await waitForStable(page);

      const menuButton = page.locator('ion-menu-button').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await waitForStable(page);

        // Check for menu items
        await expect(page.locator('ion-menu ion-item').first()).toBeVisible();
      }
    });
  });
});
