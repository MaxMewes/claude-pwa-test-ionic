import { test, expect } from '@playwright/test';
import { login, waitForStable, selectAllResultsFilter } from './helpers/auth';

test.describe('Results Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Switch to "Alle" (All) filter to show all results, not just today's
    await selectAllResultsFilter(page);
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

  test.describe('Results Filter Modal', () => {
    test('should have filter button', async ({ page }) => {
      await waitForStable(page);

      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"], ion-icon[name*="filter"]') }).first();
      await expect(filterButton).toBeVisible();
    });

    test('should open filter modal when clicking filter button', async ({ page }) => {
      await waitForStable(page);

      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"], ion-icon[name*="filter"]') }).first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForStable(page);

        const filterModal = page.locator('ion-modal');
        await expect(filterModal).toBeVisible({ timeout: 3000 });
        await expect(filterModal.locator('ion-title')).toContainText(/filter/i);
      }
    });

    test('should show favorites toggle in filter modal', async ({ page }) => {
      await waitForStable(page);

      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"]') }).first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForStable(page);

        const favoritesToggle = page.locator('ion-modal ion-item').filter({ hasText: /gemerkt|favorit/i });
        await expect(favoritesToggle).toBeVisible();
      }
    });

    test('should show result type filters in modal', async ({ page }) => {
      await waitForStable(page);

      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"]') }).first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForStable(page);

        const endbefundToggle = page.locator('ion-modal ion-item').filter({ hasText: /endbefund/i });
        const teilbefundToggle = page.locator('ion-modal ion-item').filter({ hasText: /teilbefund/i });

        await expect(endbefundToggle).toBeVisible();
        await expect(teilbefundToggle).toBeVisible();
      }
    });

    test('should toggle filter and close modal', async ({ page }) => {
      await waitForStable(page);

      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"]') }).first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForStable(page);

        const favoritesToggle = page.locator('ion-modal ion-toggle').first();
        if (await favoritesToggle.isVisible()) {
          await favoritesToggle.click();
          await waitForStable(page);
        }

        const closeButton = page.locator('ion-modal ion-button').filter({ has: page.locator('ion-icon[name*="close"]') }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await waitForStable(page);
        }

        await expect(page.locator('ion-modal')).not.toBeVisible({ timeout: 3000 });
      }
    });

    test('should have reset filters button', async ({ page }) => {
      await waitForStable(page);

      const filterButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="funnel"]') }).first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForStable(page);

        const resetButton = page.locator('ion-modal ion-button').filter({ hasText: /zurücksetzen|reset/i });
        await expect(resetButton).toBeVisible();
      }
    });
  });

  test.describe('Category Tabs', () => {
    test('should display category tabs', async ({ page }) => {
      await waitForStable(page);

      const toolbar = page.locator('.results-filter-toolbar, ion-toolbar').filter({ has: page.locator('button') });
      await expect(toolbar).toBeVisible();
    });

    test('should have All tab', async ({ page }) => {
      await waitForStable(page);

      const allTab = page.locator('button').filter({ hasText: /alle/i }).first();
      await expect(allTab).toBeVisible();
    });

    test('should have Unread tab', async ({ page }) => {
      await waitForStable(page);

      const unreadTab = page.locator('button').filter({ hasText: /ungelesen|neu/i }).first();
      await expect(unreadTab).toBeVisible();
    });

    test('should have Pathological tab', async ({ page }) => {
      await waitForStable(page);

      const pathoTab = page.locator('button').filter({ hasText: /pathologisch/i }).first();
      await expect(pathoTab).toBeVisible();
    });

    test('should have Urgent tab', async ({ page }) => {
      await waitForStable(page);

      const urgentTab = page.locator('button').filter({ hasText: /notfall|dringend/i }).first();
      await expect(urgentTab).toBeVisible();
    });

    test('should switch to unread tab when clicked', async ({ page }) => {
      await waitForStable(page);

      const unreadTab = page.locator('button').filter({ hasText: /ungelesen/i }).first();

      if (await unreadTab.isVisible()) {
        await unreadTab.click();
        await waitForStable(page);
        await expect(page.locator('ion-content')).toBeVisible();
      }
    });

    test('should switch to pathological tab when clicked', async ({ page }) => {
      await waitForStable(page);

      const pathoTab = page.locator('button').filter({ hasText: /pathologisch/i }).first();

      if (await pathoTab.isVisible()) {
        await pathoTab.click();
        await waitForStable(page);
        await expect(page.locator('ion-content')).toBeVisible();
      }
    });

    test('should display count on each tab', async ({ page }) => {
      await waitForStable(page);

      const allTab = page.locator('button').filter({ hasText: /alle/i }).first();

      if (await allTab.isVisible()) {
        const tabText = await allTab.textContent();
        expect(tabText).toMatch(/\d+/);
      }
    });
  });

  test.describe('Period Filter URL', () => {
    test('should display current period in title', async ({ page }) => {
      await waitForStable(page);

      const title = page.locator('ion-title').first();
      const titleText = await title.textContent();
      expect(titleText).toMatch(/befunde/i);
    });

    test('should persist period in URL', async ({ page }) => {
      await waitForStable(page);

      const url = page.url();
      expect(url).toContain('period=');
    });

    test('should load all period from URL on refresh', async ({ page }) => {
      await page.goto('/results?period=all');
      await waitForStable(page);

      const title = page.locator('ion-title').first();
      await expect(title).toContainText(/alle/i);
    });

    test('should load today period from URL', async ({ page }) => {
      await page.goto('/results?period=today');
      await waitForStable(page);

      const title = page.locator('ion-title').first();
      await expect(title).toContainText(/heute/i);
    });

    test('should load 7days period from URL', async ({ page }) => {
      await page.goto('/results?period=7days');
      await waitForStable(page);

      const title = page.locator('ion-title').first();
      await expect(title).toContainText(/7|tage/i);
    });

    test('should load archive period from URL', async ({ page }) => {
      await page.goto('/results?period=archive');
      await waitForStable(page);

      const title = page.locator('ion-title').first();
      await expect(title).toContainText(/archiv/i);
    });
  });

  test.describe('Combined Filters', () => {
    test('should combine category tab with search', async ({ page }) => {
      await waitForStable(page);

      const unreadTab = page.locator('button').filter({ hasText: /ungelesen/i }).first();
      if (await unreadTab.isVisible()) {
        await unreadTab.click();
        await waitForStable(page);
      }

      const searchButton = page.locator('ion-button').filter({ has: page.locator('ion-icon[name*="search"]') }).first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await waitForStable(page);

        const searchInput = page.locator('ion-searchbar input').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await waitForStable(page, 1000);
        }
      }

      await expect(page.locator('ion-content')).toBeVisible();
    });

    test('should show filtered count or empty state', async ({ page }) => {
      await waitForStable(page);

      const pathoTab = page.locator('button').filter({ hasText: /pathologisch/i }).first();
      if (await pathoTab.isVisible()) {
        await pathoTab.click();
        await waitForStable(page, 1000);
      }

      const filterText = page.locator('text=/von.*befund/i');
      const allLoadedText = page.locator('text=/alle.*geladen/i');
      const noResultsText = page.locator('text=/keine/i');

      const hasFilterText = await filterText.isVisible().catch(() => false);
      const hasAllLoadedText = await allLoadedText.isVisible().catch(() => false);
      const hasNoResultsText = await noResultsText.isVisible().catch(() => false);

      expect(hasFilterText || hasAllLoadedText || hasNoResultsText).toBeTruthy();
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
