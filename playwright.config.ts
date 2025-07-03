import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 20_000,
  use: {
    baseURL: 'http://localhost:4322',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
  webServer: {
    command: 'npm run dev -- --port 4322',
    port: 4322,
    reuseExistingServer: true,
  },
});