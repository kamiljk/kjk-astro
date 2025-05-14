import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1200, height: 900 }, // desktop
  { width: 900, height: 900 }, // tablet
  { width: 600, height: 900 }, // mobile
];

const expectedBg = {
  light: 'rgba(255, 255, 255, 0.69)',
  dark: 'rgba(26, 26, 26, 0.92)'
};

test.describe('NavbarMenu Dropdown Background', () => {
  for (const viewport of viewports) {
    for (const theme of ['light', 'dark']) {
      test(`dropdown background matches navbar in ${theme} mode at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        // Set theme
        await page.evaluate(theme => {
          document.body.dataset.theme = theme;
        }, theme);
        const menuBtn = page.locator('.nav__menu-btn');
        await menuBtn.click();
        const dropdown = page.locator('#filter-sort-menu');
        await expect(dropdown).toBeVisible();
        // Get computed background color
        const bg = await dropdown.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(bg).toBe(expectedBg[theme]);
      });
    }
  }
});
