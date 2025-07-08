import { test, expect } from '@playwright/test';

test.describe('Navbar functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display logo, search, and dropdown button', async ({ page }) => {
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('.search-container')).toBeVisible();
    await expect(page.locator('[data-dropdown-trigger]')).toBeVisible();
  });

  test('should toggle dropdown menu on click', async ({ page }) => {
    const dropdownMenu = page.locator('#filter-sort-menu');
    await expect(dropdownMenu).toBeHidden();
    await page.click('[data-dropdown-trigger]');
    await expect(dropdownMenu).toBeVisible();
    await page.click('[data-dropdown-trigger]');
    await expect(dropdownMenu).toBeHidden();
  });

  test('dropdown should close when clicking outside', async ({ page }) => {
    const dropdownMenu = page.locator('#filter-sort-menu');
    await page.click('[data-dropdown-trigger]');
    await expect(dropdownMenu).toBeVisible();
    await page.click('body');
    await expect(dropdownMenu).toBeHidden();
  });

  test('dropdown should close when search is focused', async ({ page }) => {
    const dropdownMenu = page.locator('#filter-sort-menu');
    await page.click('[data-dropdown-trigger]');
    await expect(dropdownMenu).toBeVisible();
    await page.locator('.pagefind-ui__search-input').focus();
    await expect(dropdownMenu).toBeHidden();
  });

  test('search results and dropdown are not visible simultaneously', async ({ page }) => {
    const dropdownMenu = page.locator('#filter-sort-menu');
    const searchInput = page.locator('.pagefind-ui__search-input');
    const searchResults = page.locator('.pagefind-ui__drawer');

    // Open dropdown
    await page.click('[data-dropdown-trigger]');
    await expect(dropdownMenu).toBeVisible();

    // Type in search, dropdown should close and results should appear
    await searchInput.fill('test');
    await expect(dropdownMenu).toBeHidden();
    await expect(searchResults).toBeVisible();

    // Clear search, then open dropdown
    await searchInput.fill('');
    await page.click('[data-dropdown-trigger]');
    await expect(searchResults).toBeHidden();
    await expect(dropdownMenu).toBeVisible();
  });
});
