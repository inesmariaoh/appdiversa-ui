import { defineConfig, devices } from '@playwright/test';

const E2E_DEV_PORT = process.env.PLAYWRIGHT_DEV_PORT ?? '3010';
const MOCK_API_PORT = process.env.MOCK_API_PORT ?? '18000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${E2E_DEV_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mockApi.mjs',
      url: `http://127.0.0.1:${MOCK_API_PORT}/api/v1/interfaz/configuracion/`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        MOCK_API_PORT,
      },
    },
    {
      command: `npm run build && npm run start -- -p ${E2E_DEV_PORT}`,
      url: `http://127.0.0.1:${E2E_DEV_PORT}`,
      reuseExistingServer: false,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${MOCK_API_PORT}`,
        API_BASE_URL: `http://127.0.0.1:${MOCK_API_PORT}`,
      },
    },
  ],
});
