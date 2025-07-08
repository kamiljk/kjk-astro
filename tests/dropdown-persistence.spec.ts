import { test, expect } from '@playwright/test';

test.describe('Dropdown Persistence Test', () => {
  test('dropdown should stay open when filter buttons are clicked', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();
    
    // Wait for dropdown to be visible
    const dropdown = page.locator('#dropdown-container');
    await expect(dropdown).toBeVisible();
    
    // Click a filter button
    const readButton = page.locator('.filter-btn[data-type="read"]');
    await readButton.click();
    
    // Wait a bit for any potential page changes
    await page.waitForTimeout(500);
    
    // Check that dropdown is still visible
    await expect(dropdown).toBeVisible();
    
    // Verify URL changed without page reload
    const url = page.url();
    expect(url).toContain('type=read');
    
    // Click another filter button
    const playButton = page.locator('.filter-btn[data-type="play"]');
    await playButton.click();
    
    await page.waitForTimeout(500);
    
    // Dropdown should still be visible
    await expect(dropdown).toBeVisible();
    
    // URL should have updated
    const newUrl = page.url();
    expect(newUrl).toContain('type=play');
    expect(newUrl).not.toContain('type=read');
    
    console.log('✅ Dropdown persists during filter changes!');
  });
  
  test('dropdown should stay open when sort buttons are clicked', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();
    
    const dropdown = page.locator('#dropdown-container');
    await expect(dropdown).toBeVisible();
    
    // Click a sort button
    const alphaButton = page.locator('.sort-btn[data-sort="alpha"]');
    await alphaButton.click();
    
    await page.waitForTimeout(500);
    
    // Check that dropdown is still visible
    await expect(dropdown).toBeVisible();
    
    // Verify URL changed
    const url = page.url();
    expect(url).toContain('sort=alpha');
    expect(url).toContain('order=asc');
    
    console.log('✅ Dropdown persists during sort changes!');
  });
});
