import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1200, height: 900 }, // desktop
  { width: 900, height: 900 }, // tablet
  { width: 600, height: 900 }, // mobile
];

async function assertDropdownAlignment(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto('/');

  const menuBtn = page.locator('.nav__menu-btn');
  await menuBtn.click();

  const navbar = page.locator('.navbar-header-row');
  const dropdown = page.locator('#filter-sort-menu');
  await expect(dropdown).toBeVisible();

  const navbarBox = await navbar.boundingBox();
  const dropdownBox = await dropdown.boundingBox();

  expect(navbarBox).not.toBeNull();
  expect(dropdownBox).not.toBeNull();

  if (navbarBox && dropdownBox) {
    const tolerance = 15;
    expect(Math.abs(navbarBox.x - dropdownBox.x)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(navbarBox.width - dropdownBox.width)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(dropdownBox.y - (navbarBox.y + navbarBox.height))).toBeLessThanOrEqual(tolerance);
  }

  const menuOpenState = await page.evaluate(() => {
    const menuComponent = document.querySelector('.nav__menu-btn');
    return menuComponent ? menuComponent.getAttribute('aria-expanded') : null;
  });

  console.log(`[Debug] menuOpen state: ${menuOpenState}`);
}

test.describe('NavbarMenu Dropdown Alignment', () => {
  for (const viewport of viewports) {
    test(`dropdown alignment at ${viewport.width}px`, async ({ page }) => {
      await assertDropdownAlignment(page, viewport);
    });
  }
});
