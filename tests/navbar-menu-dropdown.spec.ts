import { test, expect } from '@playwright/test';

test.describe('NavbarMenu Dropdown', () => {
  test('opens and closes on click and outside click', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('.nav__menu-btn');
    const menu = page.locator('#filter-sort-menu');
    await expect(menu).not.toBeVisible();
    await menuBtn.click();
    await expect(menu).toBeVisible();
    // Click outside
    await page.click('body', { position: { x: 0, y: 0 } });
    await expect(menu).not.toBeVisible();
  });

  test('closes on Escape and restores focus', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('.nav__menu-btn');
    await menuBtn.click();
    await expect(page.locator('#filter-sort-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#filter-sort-menu')).not.toBeVisible();
    await expect(menuBtn).toBeFocused();
  });

  test('keyboard navigation: arrow keys, Home/End', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('.nav__menu-btn');
    await menuBtn.click();
    const pills = page.locator('#filter-sort-menu button[class*="pill"]');
    await expect(pills.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(pills.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(pills.first()).toBeFocused();
    await page.keyboard.press('End');
    await expect(pills.last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(pills.first()).toBeFocused();
  });

  test('selecting a filter closes menu and updates URL', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('.nav__menu-btn');
    await menuBtn.click();
    const aboutPill = page.locator('#filter-sort-menu button[class*="pill"]', { hasText: 'About' });
    await aboutPill.click();
    await expect(page.locator('#filter-sort-menu')).not.toBeVisible();
    await expect(page).toHaveURL(/type=about/);
  });

  test('ARIA attributes and focus are correct', async ({ page }) => {
    await page.goto('/');
    const menuBtn = page.locator('.nav__menu-btn');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('#filter-sort-menu');
    await expect(menu).toHaveAttribute('aria-hidden', 'false');
    await page.keyboard.press('Escape');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('debug logs for menuOpen and portalTarget', async ({ page }) => {
    await page.goto('/');
    // Fix debug logs to access menuOpen from the component
    const menuOpenState = await page.evaluate(() => {
      const menuComponent = document.querySelector('.nav__menu-btn');
      return menuComponent ? menuComponent.getAttribute('aria-expanded') : null;
    });
    console.log(`[Debug] menuOpen state during test: ${menuOpenState}`);
    console.log(`[Debug] portalTarget during test: ${await page.evaluate(() => document.querySelector('#navbar-dropdown-portal'))}`);
  });
});
