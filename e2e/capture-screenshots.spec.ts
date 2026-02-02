import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.join(__dirname, '../docs/handbook/docs/assets/screenshots');

// Test credentials from environment variables (see .env file)
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || 'demo',
  password: process.env.TEST_PASSWORD || 'demo',
};

// Helper function to save screenshot
async function screenshot(page: Page, name: string, description?: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
  console.log(`Screenshot: ${description || name} -> ${name}.png`);
}

// Helper to wait for page to be stable and all data loaded
async function waitForStable(page: Page, timeout = 1000) {
  // Wait for network to be idle (no pending requests)
  await page.waitForLoadState('networkidle').catch(() => {});
  // Wait for DOM to be stable
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  // Additional wait for animations and dynamic content
  await page.waitForTimeout(timeout);
  // Wait for any loading spinners to disappear
  await page.locator('ion-loading, ion-spinner, .loading').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  // Extra buffer for rendering
  await page.waitForTimeout(300);
}

// Helper function to perform login (silent - no screenshots)
async function performLogin(page: Page) {
  await page.goto('/login');
  await waitForStable(page, 1500);

  // Check if already logged in (no login form visible)
  const loginButton = page.locator('ion-button[type="submit"]').first();
  const isLoginPage = await loginButton.isVisible().catch(() => false);

  if (!isLoginPage) {
    // Already logged in or on different page
    return;
  }

  // Fill username
  const usernameInput = page.locator('input[type="text"], ion-input input').first();
  if (await usernameInput.isVisible().catch(() => false)) {
    await usernameInput.fill(TEST_CREDENTIALS.username);
  }

  // Fill password
  const passwordInput = page.locator('input[type="password"]').first();
  if (await passwordInput.isVisible().catch(() => false)) {
    await passwordInput.fill(TEST_CREDENTIALS.password);
  }

  // Click login button
  if (await loginButton.isVisible().catch(() => false)) {
    await loginButton.click();
  }

  // Wait for login to complete
  await waitForStable(page, 2000);

  // Handle lab selection if shown
  const labSelectVisible = await page.locator('text=Labor auswählen').isVisible().catch(() => false);
  if (labSelectVisible) {
    const firstLab = page.locator('ion-item').first();
    await firstLab.click();
    await waitForStable(page, 1500);
  }
}

test.describe('PSR-Style Handbook Screenshots', () => {
  // Increase timeout for all tests due to API latency
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile (Pixel 5)
    await page.setViewportSize({ width: 393, height: 851 });
  });

  // ============================================
  // SECTION 1: LOGIN FLOW
  // ============================================
  test('01 - Login Screen', async ({ page }) => {
    await page.goto('/login');
    await waitForStable(page);
    await screenshot(page, '01-login-screen', 'Schritt 1: Anmeldebildschirm wird angezeigt');
  });

  test('02 - Login with Credentials', async ({ page }) => {
    await page.goto('/login');
    await waitForStable(page, 1000);

    // Step: Enter username
    const usernameInput = page.locator('input[type="text"], ion-input input').first();
    if (await usernameInput.isVisible().catch(() => false)) {
      await usernameInput.fill(TEST_CREDENTIALS.username);
      await waitForStable(page, 300);
      await screenshot(page, '02-login-username', 'Schritt 2: Benutzername wurde eingegeben');
    }

    // Step: Enter password
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible().catch(() => false)) {
      await passwordInput.fill(TEST_CREDENTIALS.password);
      await waitForStable(page, 300);
      await screenshot(page, '03-login-password', 'Schritt 3: Passwort wurde eingegeben');
    }

    // Step: Click login button
    const loginButton = page.locator('ion-button[type="submit"]').first();
    if (await loginButton.isVisible().catch(() => false)) {
      await loginButton.click();
      await waitForStable(page, 2000);
      await screenshot(page, '04-login-success', 'Schritt 4: Anmeldung erfolgreich');
    }

    // Step: Lab selection if shown
    const labSelectVisible = await page.locator('text=Labor auswählen').isVisible().catch(() => false);
    if (labSelectVisible) {
      await screenshot(page, '05-lab-selection', 'Schritt 5: Laborauswahl wird angezeigt');
      const firstLab = page.locator('ion-item').first();
      await firstLab.click();
      await waitForStable(page, 1000);
      await screenshot(page, '06-lab-selected', 'Schritt 6: Labor wurde ausgewählt');
    }
  });

  // ============================================
  // SECTION 2: RESULTS / BEFUNDE
  // ============================================
  test('03 - Results Overview', async ({ page }) => {
    await performLogin(page);
    await page.goto('/results');
    await waitForStable(page, 2000);

    // Select "All" tab to ensure data is available
    const allTab = page.locator('ion-segment-button:has-text("Alle")').first();
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await waitForStable(page, 1500);
    }

    await screenshot(page, '10-results-overview', 'Schritt 10: Befundübersicht wird angezeigt');
  });

  test('04 - Results Search', async ({ page }) => {
    await performLogin(page);
    await page.goto('/results');
    await waitForStable(page, 2000);

    // Select "All" tab to ensure data is available
    const allTab = page.locator('ion-segment-button:has-text("Alle")').first();
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await waitForStable(page, 1500);
    }

    // Step: Click search button (in toolbar end slot)
    const searchButton = page.locator('ion-toolbar ion-buttons[slot="end"] ion-button').first();
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click();
      await waitForStable(page, 500);
      await screenshot(page, '11-results-search-open', 'Schritt 11: Suchfeld wurde geöffnet');

      // Step: Enter search term
      const searchInput = page.locator('ion-searchbar input').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('Müller');
        await waitForStable(page, 500);
        await screenshot(page, '12-results-search-typed', 'Schritt 12: Suchbegriff eingegeben');
      }
    }
  });

  test('05 - Results Filter', async ({ page }) => {
    await performLogin(page);
    await page.goto('/results');
    await waitForStable(page, 2000);

    // Select "All" tab to ensure data is available
    const allTab = page.locator('ion-segment-button:has-text("Alle")').first();
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await waitForStable(page, 1500);
    }

    // Step: Click filter button (second button in toolbar end slot)
    const filterButton = page.locator('ion-toolbar ion-buttons[slot="end"] ion-button').nth(1);
    if (await filterButton.isVisible().catch(() => false)) {
      await filterButton.click();
      await waitForStable(page, 500);
      await screenshot(page, '13-results-filter-modal', 'Schritt 13: Filter-Dialog geöffnet');

      // Step: Select a filter option if available
      const filterToggle = page.locator('ion-toggle').first();
      if (await filterToggle.isVisible().catch(() => false)) {
        await filterToggle.click();
        await waitForStable(page, 300);
        await screenshot(page, '14-results-filter-active', 'Schritt 14: Filter aktiviert');
      }
    }
  });

  test('06 - Results Detail View', async ({ page }) => {
    await performLogin(page);
    await page.goto('/results');
    await waitForStable(page, 2000);

    // Select "All" tab to ensure data is available
    const allTab = page.locator('ion-segment-button:has-text("Alle")').first();
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await waitForStable(page, 1500);
    }

    // Step: Click on first result
    const firstResult = page.locator('ion-item').first();
    if (await firstResult.isVisible().catch(() => false)) {
      await firstResult.click();
      await waitForStable(page, 1000);
      await screenshot(page, '15-results-detail', 'Schritt 15: Befunddetails Kopfbereich');

      // Step: Scroll down to see values
      await page.evaluate(() => window.scrollTo(0, 300));
      await waitForStable(page, 500);
      await screenshot(page, '16-results-detail-values', 'Schritt 16: Befundwerte angezeigt');

      // Step: Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await waitForStable(page, 500);
      await screenshot(page, '17-results-detail-footer', 'Schritt 17: Befund Fußbereich');
    }
  });

  // ============================================
  // SECTION 3: PATIENTS / PATIENTEN
  // ============================================
  test('07 - Patients List', async ({ page }) => {
    await performLogin(page);
    await page.goto('/patients');
    await waitForStable(page, 2000);
    await screenshot(page, '20-patients-list', 'Schritt 20: Patientenliste wird angezeigt');
  });

  test('08 - Patients Search', async ({ page }) => {
    await performLogin(page);
    await page.goto('/patients');
    await waitForStable(page, 2000);

    // Step: Open search (click search button in toolbar)
    const searchButton = page.locator('ion-toolbar ion-buttons[slot="end"] ion-button').first();
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click();
      await waitForStable(page, 500);
      await screenshot(page, '21-patients-search', 'Schritt 21: Patientensuche geöffnet');
    }
  });

  test('09 - Patients Accordion', async ({ page }) => {
    await performLogin(page);
    await page.goto('/patients');
    await waitForStable(page, 3000);

    // Step: Click on first accordion to expand it using JavaScript
    const accordionCount = await page.locator('ion-accordion-group ion-accordion').count();
    console.log('Accordion count:', accordionCount);

    if (accordionCount > 0) {
      // Use JavaScript to click the accordion (bypasses Ionic shadow DOM visibility issues)
      await page.evaluate(() => {
        const accordion = document.querySelector('ion-accordion-group ion-accordion');
        if (accordion) (accordion as HTMLElement).click();
      });
      await waitForStable(page, 1000);
      await screenshot(page, '22-patients-expanded', 'Schritt 22: Patientengruppe geöffnet');

      // Step: Click on first patient row in the expanded content
      const patientRows = page.locator('ion-accordion div[slot="content"] > div');
      const patientCount = await patientRows.count();
      console.log('Patient rows in accordion:', patientCount);

      if (patientCount > 0) {
        // Use JavaScript to click the first patient row
        await page.evaluate(() => {
          const patientRow = document.querySelector('ion-accordion div[slot="content"] > div');
          if (patientRow) (patientRow as HTMLElement).click();
        });
        await waitForStable(page, 1500);
        await screenshot(page, '23-patients-detail', 'Schritt 23: Patientendetails');
      }
    }
  });

  // ============================================
  // SECTION 4: LABORATORIES / LABORE
  // ============================================
  test('10 - Laboratories List', async ({ page }) => {
    await performLogin(page);
    await page.goto('/laboratories');
    await waitForStable(page, 2000);
    await screenshot(page, '30-laboratories-list', 'Schritt 30: Laborübersicht');
  });

  test('11 - Laboratory Details', async ({ page }) => {
    await performLogin(page);
    await page.goto('/laboratories');
    await waitForStable(page, 3000);

    // Click first lab by finding text "Zytologie" or any h2 in ion-item
    const labText = page.locator('ion-list ion-item h2').first();
    const labName = await labText.textContent();
    console.log('Found lab:', labName);

    // Click on the lab item using text
    if (labName) {
      await page.locator(`ion-item:has-text("${labName}")`).first().click({ timeout: 5000 }).catch(() => {
        console.log('Regular click failed, trying force click');
      });
    }

    await waitForStable(page, 2000);
    console.log('Current URL:', page.url());

    // If navigation didn't work, try direct navigation to a known lab
    if (!page.url().match(/\/laboratories\/\d+/)) {
      // Get lab IDs from the page
      const labIds = await page.evaluate(() => {
        const items = document.querySelectorAll('ion-list ion-item');
        // Try to find lab ID from data attributes or onclick
        return Array.from(items).map((item, i) => i);
      });
      console.log('Trying direct navigation');
      // Try common IDs
      for (const testId of [100, 101, 102, 1000, 10000]) {
        await page.goto(`/laboratories/${testId}`);
        await waitForStable(page, 1500);
        const hasContent = await page.locator('text=Labor nicht gefunden').count() === 0;
        if (hasContent) {
          console.log(`Found valid lab at ID ${testId}`);
          break;
        }
      }
    }

    // Check if we have a valid lab page
    const isValidPage = await page.locator('ion-footer button').count() > 0;
    if (isValidPage) {
      await screenshot(page, '31-laboratory-info', 'Schritt 31: Laborinformationen');

      // Services tab
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('ion-footer button');
        if (buttons[1]) (buttons[1] as HTMLElement).click();
      });
      await waitForStable(page, 1000);
      await screenshot(page, '32-laboratory-services', 'Schritt 32: Leistungskatalog');

      // Contacts tab
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('ion-footer button');
        if (buttons[2]) (buttons[2] as HTMLElement).click();
      });
      await waitForStable(page, 1000);
      await screenshot(page, '33-laboratory-contacts', 'Schritt 33: Kontaktdaten');
    } else {
      console.log('Could not navigate to valid lab page');
      // Take screenshot of list as fallback
      await page.goto('/laboratories');
      await waitForStable(page, 2000);
      await screenshot(page, '31-laboratory-info', 'Schritt 31: Laborübersicht (Fallback)');
    }
  });

  // ============================================
  // SECTION 5: NEWS / NEUIGKEITEN
  // ============================================
  test('12 - News List', async ({ page }) => {
    await performLogin(page);
    await page.goto('/news');
    await waitForStable(page, 2000);
    await screenshot(page, '40-news-list', 'Schritt 40: Neuigkeiten-Übersicht');
  });

  test('13 - News Detail', async ({ page }) => {
    await performLogin(page);
    await page.goto('/news');
    await waitForStable(page, 2000);

    // Step: Click on first news item
    const firstNews = page.locator('ion-card').first();
    if (await firstNews.isVisible().catch(() => false)) {
      await firstNews.click();
      await waitForStable(page, 1000);
      await screenshot(page, '41-news-detail', 'Schritt 41: Nachrichtendetail');

      // Step: Scroll to see full content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await waitForStable(page, 500);
      await screenshot(page, '42-news-detail-full', 'Schritt 42: Vollständiger Inhalt');
    }
  });

  // ============================================
  // SECTION 6: SETTINGS / EINSTELLUNGEN
  // ============================================
  test('14 - Settings Overview', async ({ page }) => {
    await performLogin(page);
    await page.goto('/settings');
    await waitForStable(page, 2000);
    await screenshot(page, '50-settings-overview', 'Schritt 50: Einstellungen');

    // Step: Scroll to see all settings
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await waitForStable(page, 500);
    await screenshot(page, '51-settings-more', 'Schritt 51: Weitere Einstellungen');
  });

  // ============================================
  // SECTION 7: NAVIGATION
  // ============================================
  test('15 - Side Menu', async ({ page }) => {
    await performLogin(page);
    await page.goto('/results');
    await waitForStable(page, 2000);

    // Select "All" tab to ensure data is available
    const allTab = page.locator('ion-segment-button:has-text("Alle")').first();
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await waitForStable(page, 1500);
    }

    // Step: Open side menu
    const menuButton = page.locator('ion-menu-button').first();
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await waitForStable(page, 500);
      await screenshot(page, '60-menu-open', 'Schritt 60: Seitenmenü geöffnet');
    }
  });

  // ============================================
  // SECTION 8: BARCODE SCANNER
  // ============================================
  test('16 - Barcode Scanner', async ({ page }) => {
    await performLogin(page);
    await page.goto('/results');
    await waitForStable(page, 2000);

    // Select "All" tab to ensure data is available
    const allTab = page.locator('ion-segment-button:has-text("Alle")').first();
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await waitForStable(page, 1500);
    }

    // Close any open modals first
    await page.evaluate(() => {
      const modals = document.querySelectorAll('ion-modal');
      modals.forEach((modal: any) => modal.dismiss?.());
    });
    await waitForStable(page, 500);

    // In normal mode, buttons are: [0]=Filter, [1]=Search
    // Click SEARCH button (second button, index 1)
    const buttonCount1 = await page.evaluate(() => {
      const buttons = document.querySelectorAll('ion-toolbar ion-buttons[slot="end"] ion-button');
      console.log('Normal mode buttons:', buttons.length);
      if (buttons[1]) {
        (buttons[1] as HTMLElement).click(); // Search button
        return buttons.length;
      }
      return 0;
    });
    console.log('Normal mode buttons:', buttonCount1);
    await waitForStable(page, 1000);

    // In search mode, buttons are: [0]=Barcode, [1]=Close
    // Click BARCODE button (first button, index 0)
    const buttonCount2 = await page.evaluate(() => {
      const buttons = document.querySelectorAll('ion-toolbar ion-buttons[slot="end"] ion-button');
      console.log('Search mode buttons:', buttons.length);
      if (buttons[0]) {
        (buttons[0] as HTMLElement).click(); // Barcode button
        return buttons.length;
      }
      return 0;
    });
    console.log('Search mode buttons:', buttonCount2);
    await waitForStable(page, 1500);

    // Check if barcode scanner modal is open
    const modalCount = await page.locator('ion-modal').count();
    console.log('Modal count:', modalCount);
    if (modalCount > 0) {
      await screenshot(page, '70-barcode-scanner', 'Schritt 70: Barcode-Scanner');
    } else {
      console.log('Barcode modal not opened');
    }
  });

  // ============================================
  // SECTION 9: HELP / HILFE
  // ============================================
  test('17 - FAQ Page', async ({ page }) => {
    await performLogin(page);
    await page.goto('/faq');
    await waitForStable(page, 2000);
    await screenshot(page, '80-faq-overview', 'Schritt 80: FAQ-Seite');

    // Step: Expand FAQ item
    const faqItem = page.locator('ion-accordion').first();
    if (await faqItem.isVisible().catch(() => false)) {
      await faqItem.click();
      await waitForStable(page, 500);
      await screenshot(page, '81-faq-expanded', 'Schritt 81: FAQ-Antwort');
    }
  });

  test('18 - About Page', async ({ page }) => {
    await performLogin(page);
    await page.goto('/about');
    await waitForStable(page, 2000);
    await screenshot(page, '90-about-page', 'Schritt 90: Über labGate');
  });
});
