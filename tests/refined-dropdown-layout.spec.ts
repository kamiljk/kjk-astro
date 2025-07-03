import { test, expect } from '@playwright/test';

test.describe('Refined Dropdown Layout', () => {
  test('should have balanced section proportions with theme toggle present', async ({ page }) => {
    await page.goto('http://localhost:4324/');
    await page.waitForLoadState('networkidle');
    
    // Open the dropdown
    await page.click('.nav__menu-btn');
    await page.waitForSelector('#filter-sort-menu', { state: 'visible' });
    
    // Check that all three sections are present
    const filterSection = page.locator('#filter-sort-menu .filter-section');
    const sortSection = page.locator('#filter-sort-menu .sort-section');
    const themeSection = page.locator('#filter-sort-menu .theme-toggle-section');
    
    await expect(filterSection).toBeVisible();
    await expect(sortSection).toBeVisible();
    await expect(themeSection).toBeVisible();
    
    // Check that the theme toggle button is present
    const themeToggleBtn = page.locator('#filter-sort-menu .theme-toggle-btn');
    await expect(themeToggleBtn).toBeVisible();
    
    // Get section widths to verify proportions
    const filterBox = await filterSection.boundingBox();
    const sortBox = await sortSection.boundingBox();
    const themeBox = await themeSection.boundingBox();
    
    console.log(`Filter section width: ${filterBox?.width}px`);
    console.log(`Sort section width: ${sortBox?.width}px`);
    console.log(`Theme section width: ${themeBox?.width}px`);
    
    // Filter should be largest, theme should be smallest
    expect(filterBox!.width).toBeGreaterThan(sortBox!.width);
    expect(sortBox!.width).toBeGreaterThan(themeBox!.width);
    
    // Theme section should be compact (less than 200px)
    expect(themeBox!.width).toBeLessThan(200);
    
    // Test theme toggle functionality
    const initialTheme = await page.evaluate(() => document.body.dataset.theme);
    await themeToggleBtn.click();
    await page.waitForTimeout(100); // Small delay for theme change
    const newTheme = await page.evaluate(() => document.body.dataset.theme);
    expect(newTheme).not.toBe(initialTheme);
    
    await page.screenshot({ 
      path: 'test-results/refined-dropdown-layout.png',
      fullPage: false 
    });
  });
  
  test('should maintain elegant spacing and alignment', async ({ page }) => {
    await page.goto('http://localhost:4324/');
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav__menu-btn');
    await page.waitForSelector('#filter-sort-menu', { state: 'visible' });
    
    // Check section labels are properly styled
    const sectionLabels = page.locator('#filter-sort-menu .section-label');
    await expect(sectionLabels).toHaveCount(2); // Filter and Sort labels
    
    // Check pill spacing in filter section
    const filterPills = page.locator('#filter-sort-menu .filter-section button');
    const pillCount = await filterPills.count();
    expect(pillCount).toBeGreaterThan(2); // Should have multiple filter pills
    
    // Check sort items are properly structured
    const sortItems = page.locator('#filter-sort-menu .sort-item');
    const sortCount = await sortItems.count();
    expect(sortCount).toBeGreaterThan(1); // Should have multiple sort options
    
    await page.screenshot({ 
      path: 'test-results/dropdown-spacing-elements.png',
      fullPage: false 
    });
  });
});
