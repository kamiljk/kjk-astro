import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Helper to check if a static HTML file exists for a given route
function routeExists(route) {
  // Remove leading/trailing slashes and split
  const parts = route.replace(/^\//, '').replace(/\/$/, '').split('/');
  let filePath = path.join('dist', ...parts);
  if (fs.existsSync(filePath + '.html')) return true;
  if (fs.existsSync(path.join(filePath, 'index.html'))) return true;
  return false;
}

const routes = [
  '/',
  '/read/',
  '/play/',
  '/about/',
  '/page/2',
  '/read/page/2',
  '/play/page/2',
  '/about/page/2',
];

for (const route of routes) {
  test(`Route ${route} should not 404 if it exists`, async ({ page }) => {
    if (!routeExists(route)) {
      test.skip();
      return;
    }
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
  });
}
