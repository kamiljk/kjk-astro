import { test, expect } from '@playwright/test';

// Basic Pagefind search UI test

test.describe('Pagefind Search UI', () => {
  test('shows search results and navigates correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the Pagefind UI search input to load
    await page.waitForSelector('.pagefind-ui__search-input', { timeout: 10000 });
    
    // Type a query that should match a post (e.g., "technology")
    await page.fill('.pagefind-ui__search-input', 'technology');
    
    // Wait for results to appear
    await page.waitForSelector('.pagefind-ui__result', { timeout: 5000 });
    
    // Check that at least one result is visible
    const results = await page.$$('.pagefind-ui__result');
    expect(results.length).toBeGreaterThan(0);
    
    // Click the first result link
    await page.click('.pagefind-ui__result-link');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Check that we navigated to a page (URL should have changed)
    const url = page.url();
    expect(url).not.toBe('http://localhost:4323/');
  });

  test('dedicated search page works correctly', async ({ page }) => {
    await page.goto('/search');
    
    // Wait for the search input to load
    await page.waitForSelector('.pagefind-ui__search-input', { timeout: 10000 });
    
    // Type a search query
    await page.fill('.pagefind-ui__search-input', 'art');
    
    // Wait for results to appear
    await page.waitForSelector('.pagefind-ui__result', { timeout: 5000 });
    
    // Check that results are visible
    const results = await page.$$('.pagefind-ui__result');
    expect(results.length).toBeGreaterThan(0);
    
    // Check that the results count is displayed
    const resultsCount = await page.textContent('.pagefind-ui__message');
    expect(resultsCount).toContain('result');
  });

  test('search clears and closes properly', async ({ page }) => {
    await page.goto('/search');
    
    // Wait for search input
    await page.waitForSelector('.pagefind-ui__search-input', { timeout: 10000 });
    
    // Type a query
    await page.fill('.pagefind-ui__search-input', 'test');
    
    // Wait for results
    await page.waitForSelector('.pagefind-ui__drawer', { timeout: 5000 });
    
    // Click the clear button if it appears
    const clearButton = await page.$('.pagefind-ui__search-clear-button');
    if (clearButton) {
      await clearButton.click();
      
      // Check that input is cleared
      const inputValue = await page.inputValue('.pagefind-ui__search-input');
      expect(inputValue).toBe('');
      
      // Check that results drawer is hidden
      const drawer = await page.$('.pagefind-ui__drawer');
      if (drawer) {
        const isVisible = await drawer.isVisible();
        expect(isVisible).toBe(false);
      }
    }
  });
});
