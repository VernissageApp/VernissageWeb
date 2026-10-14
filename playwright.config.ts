import { defineConfig, devices } from '@playwright/test';

// The backend and the built Angular SSR application must already be running.
export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 90_000,
    expect: { timeout: 15_000 },
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
        // Test the current server build without cached PWA assets. PWA/offline is a separate suite.
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
        { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
    ],
});
