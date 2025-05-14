import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1200, height: 900 }, // desktop
  { width: 900, height: 900 }, // tablet
  { width: 600, height: 900 }, // mobile
];

test.describe('NavbarMenu Dropdown Alignment', () => {
  for (const viewport of viewports) {
    test(`dropdown is flush and matches navbar width at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const menuBtn = page.locator('.nav__menu-btn');
      await menuBtn.click();
      const navbar = page.locator('.navbar-header-row');
      const dropdown = page.locator('#filter-sort-menu');
      await expect(dropdown).toBeVisible();
      // Get bounding boxes
      const navbarBox = await navbar.boundingBox();
      const dropdownBox = await dropdown.boundingBox();
      // Assert left, width, and top alignment
      expect(navbarBox).not.toBeNull();
      expect(dropdownBox).not.toBeNull();
      if (navbarBox && dropdownBox) {
        // Allow 1px tolerance for subpixel rendering
        expect(Math.abs(navbarBox.x - dropdownBox.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(navbarBox.width - dropdownBox.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(dropdownBox.y - (navbarBox.y + navbarBox.height))).toBeLessThanOrEqual(1);
      }
    });
  }
});
