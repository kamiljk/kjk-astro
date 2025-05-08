import { test, expect } from '@playwright/test';

// Basic Pagefind search UI test

test.describe('Pagefind Search UI', () => {
  test('shows search results and navigates correctly', async ({ page }) => {
    await page.goto('/');
    // Wait for the Pagefind UI search input to load
    await page.waitForSelector('#pagefind-search-ui .pagefind-ui__search-input', { timeout: 10000 });
    // Type a query that should match a post (e.g., "Jazz")
    await page.fill('#pagefind-search-ui .pagefind-ui__search-input', 'Jazz');
    // Wait for results to appear
    await page.waitForSelector('.pagefind-ui__result', { timeout: 5000 });
    // Check that at least one result is visible
    const results = await page.$$('.pagefind-ui__result');
    expect(results.length).toBeGreaterThan(0);
    // Click the first result
    await results[0].click();
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    // Check that the new page contains the search term in the heading or content
    const content = await page.content();
    expect(content.toLowerCase()).toContain('jazz');
  });
});
