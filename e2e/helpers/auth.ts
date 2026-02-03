import { Page, expect } from '@playwright/test';

// Test credentials from environment variables
export const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || 'demo',
  password: process.env.TEST_PASSWORD || 'demo',
};

/**
 * Login to the application
 */
export async function login(page: Page, credentials = TEST_CREDENTIALS) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Fill username - target the native input inside ion-input
  const usernameInput = page.locator('ion-input input').first();
  await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
  await usernameInput.fill(credentials.username);

  // Fill password - find the password input
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.fill(credentials.password);

  // Click login button
  const loginButton = page.locator('ion-button[type="submit"]');
  await loginButton.click();

  // Wait for navigation to results page or for content to load
  try {
    await page.waitForURL('**/results', { timeout: 15000 });
  } catch {
    // If redirect doesn't happen, check if we're already logged in
    await page.waitForTimeout(2000);
  }
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
  // Open side menu
  const menuButton = page.locator('ion-menu-button').first();

  if (await menuButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await menuButton.click();
    await page.waitForTimeout(800);

    // Wait for menu to be visible
    const menu = page.locator('ion-menu');
    await menu.waitFor({ state: 'visible', timeout: 3000 });

    // Click logout
    const logoutItem = page.locator('ion-menu ion-item').filter({ hasText: /abmelden/i });
    await logoutItem.click();

    // Wait for redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();
  return !url.includes('/login') && !url.includes('/register');
}

/**
 * Wait for page to be stable (network idle + small delay)
 */
export async function waitForStable(page: Page, delay = 500) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    // Network idle might timeout, continue anyway
  }
  await page.waitForTimeout(delay);
}

/**
 * Select "Alle" (All) time filter on results page to show all results
 */
export async function selectAllResultsFilter(page: Page) {
  // Look for the "Alle" segment button or filter option
  const alleButton = page.locator('ion-segment-button').filter({ hasText: /alle/i });

  if (await alleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await alleButton.click();
    await waitForStable(page, 1000);
  }
}
