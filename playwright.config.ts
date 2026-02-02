import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:8100';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
  },

  projects: [
    // ===========================================
    // Mobile Devices - Primary targets for PWA
    // ===========================================
    {
      name: 'Mobile Chrome (Pixel 5)',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'Mobile Chrome (Galaxy S9+)',
      use: {
        ...devices['Galaxy S9+'],
      },
    },
    {
      name: 'Mobile Chrome (Galaxy S23)',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    },
    {
      name: 'Mobile Safari (iPhone 12)',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'Mobile Safari (iPhone 14)',
      use: {
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'Mobile Safari (iPhone SE)',
      use: {
        ...devices['iPhone SE'],
      },
    },

    // ===========================================
    // Desktop Browsers
    // ===========================================
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // ===========================================
    // Custom Viewports for responsive testing
    // ===========================================
    {
      name: 'Small Mobile (320px)',
      use: {
        browserName: 'chromium',
        viewport: { width: 320, height: 568 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Large Mobile (428px)',
      use: {
        browserName: 'chromium',
        viewport: { width: 428, height: 926 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Small Tablet (768px)',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
