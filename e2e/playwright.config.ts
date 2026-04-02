import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    locale: 'he-IL',
    extraHTTPHeaders: { 'Accept-Language': 'he-IL' },
  },

  projects: [
    // ── Desktop browsers ──────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // ── Mobile / Tablet ───────────────────────────────────────────────────────
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Requires the full stack to be running via docker compose up
  webServer: {
    command: 'echo "Stack should already be running via docker compose up"',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
