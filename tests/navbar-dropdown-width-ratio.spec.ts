import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1200, height: 900 }, // desktop
  { width: 900, height: 900 }, // tablet
  { width: 600, height: 900 }, // mobile
];

test.describe('Navbar/Dropdown/Feed Width Ratio', () => {
  for (const viewport of viewports) {
    test(`navbar > dropdown > feed width ratio at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      // Open dropdown
      const menuBtn = page.locator('.nav__menu-btn');
      await menuBtn.click();
      const navbar = page.locator('.navbar-header-row');
      const dropdown = page.locator('#filter-sort-menu');
      const feed = page.locator('#posts-feed');
      await expect(dropdown).toBeVisible();
      // Get bounding boxes
      const navbarBox = await navbar.boundingBox();
      const dropdownBox = await dropdown.boundingBox();
      const feedBox = await feed.boundingBox();
      expect(navbarBox).not.toBeNull();
      expect(dropdownBox).not.toBeNull();
      expect(feedBox).not.toBeNull();
      if (navbarBox && dropdownBox && feedBox) {
        // Assert navbar is widest, then dropdown, then feed
        expect(navbarBox.width).toBeGreaterThan(dropdownBox.width);
        expect(dropdownBox.width).toBeGreaterThan(feedBox.width);
        // Assert dropdown is slightly smaller than navbar (about 1rem/16px smaller)
        // Expected ratio should be around 0.95-0.99 based on CSS calc(navbar-width - 1rem)
        const ratio = dropdownBox.width / navbarBox.width;
        expect(ratio).toBeGreaterThan(0.90); // Allow some flexibility
        expect(ratio).toBeLessThan(1.0);   // Must be smaller than navbar
      }
    });
  }
});
