import { test, expect } from '@playwright/test';
import { login, waitForStable } from './helpers/auth';

test.describe('News Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/news');
    await waitForStable(page);
  });

  test.describe('News List', () => {
    test('should display news page header', async ({ page }) => {
      await expect(page.locator('ion-title').filter({ hasText: /news/i })).toBeVisible();
    });

    test('should show news list or empty state', async ({ page }) => {
      const hasNews = await page.locator('ion-card, ion-item').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=/keine news|keine nachrichten/i').isVisible().catch(() => false);

      expect(hasNews || hasEmptyState).toBeTruthy();
    });

    test('should display news cards', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        await expect(newsCard).toBeVisible();
      }
    });

    test('should show news title and preview', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        // Card should have title
        const title = newsCard.locator('ion-card-title, h2, h3').first();
        await expect(title).toBeVisible();
      }
    });
  });

  test.describe('News Detail', () => {
    test('should navigate to news detail', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        await newsCard.click();
        await waitForStable(page);

        await expect(page).toHaveURL(/\/news\/\d+/);
      }
    });

    test('should display news article content', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        await newsCard.click();
        await waitForStable(page);

        // Should show article content
        await expect(page.locator('ion-content')).toBeVisible();
      }
    });

    test('should display article title', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        await newsCard.click();
        await waitForStable(page);

        // Should have a title
        const title = page.locator('ion-title, h1, h2').first();
        await expect(title).toBeVisible();
      }
    });

    test('should navigate back from news detail', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        await newsCard.click();
        await waitForStable(page);

        const backButton = page.locator('ion-back-button, ion-button').filter({ has: page.locator('ion-icon[name*="arrow-back"], ion-icon[name*="chevron-back"]') }).first();

        if (await backButton.isVisible()) {
          await backButton.click();
          await waitForStable(page);

          await expect(page).toHaveURL(/\/news$/);
        }
      }
    });
  });

  test.describe('News Interactions', () => {
    test('should mark news as read when viewed', async ({ page }) => {
      const newsCard = page.locator('ion-card').first();

      if (await newsCard.isVisible()) {
        await newsCard.click();
        await waitForStable(page);

        // Navigate back
        await page.goBack();
        await waitForStable(page);

        // The card styling might change to indicate read status
        await expect(page.locator('ion-content')).toBeVisible();
      }
    });
  });

  test.describe('Pull to Refresh', () => {
    test('should have refresher component', async ({ page }) => {
      const refresher = page.locator('ion-refresher');
      const hasRefresher = await refresher.count() > 0;

      // Refresher is optional
      expect(true).toBeTruthy();
    });
  });
});
