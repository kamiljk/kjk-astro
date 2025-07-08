import { test, expect } from '@playwright/test';

test.describe('Dropdown Button Spacing Fix', () => {
  test('should have proper breathing room between navbar and dropdown buttons', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:4324/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Click the dropdown menu button to open the dropdown
    await page.click('.nav__menu-btn');
    
    // Wait for dropdown to be visible
    await page.waitForSelector('#filter-sort-menu', { state: 'visible' });
    
    // Get the navbar bottom position
    const navbar = await page.locator('.site-header');
    const navbarBox = await navbar.boundingBox();
    
    // Get the dropdown container position
    const dropdown = await page.locator('#filter-sort-menu');
    const dropdownBox = await dropdown.boundingBox();
    
    // Calculate the gap between navbar bottom and dropdown top
    const gap = dropdownBox!.y - (navbarBox!.y + navbarBox!.height);
    
    console.log(`Navbar bottom: ${navbarBox!.y + navbarBox!.height}`);
    console.log(`Dropdown top: ${dropdownBox!.y}`);
    console.log(`Gap: ${gap}px`);
    
    // The dropdown should connect to the navbar (gap should be 0 or very small)
    expect(Math.abs(gap)).toBeLessThan(5);
    
    // Now check that there's proper internal spacing within the dropdown
    // Find any button inside the dropdown (using a broader selector)
    const firstButton = await page.locator('#filter-sort-menu button').first();
    const firstButtonBox = await firstButton.boundingBox();
    
    // Calculate the internal gap from dropdown top to first button
    const internalGap = firstButtonBox!.y - dropdownBox!.y;
    
    console.log(`Internal gap: ${internalGap}px`);
    
    // There should be substantial internal padding (at least 20px)
    expect(internalGap).toBeGreaterThan(20);
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/dropdown-spacing-fix.png',
      fullPage: false 
    });
  });
  
  test('should have proper spacing on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:4324/');
    await page.waitForLoadState('networkidle');
    
    // Click the dropdown menu button
    await page.click('.nav__menu-btn');
    await page.waitForSelector('#filter-sort-menu', { state: 'visible' });
    
    // Check internal spacing on mobile
    const dropdown = await page.locator('#filter-sort-menu');
    const dropdownBox = await dropdown.boundingBox();
    
    const firstButton = await page.locator('#filter-sort-menu button').first();
    const firstButtonBox = await firstButton.boundingBox();
    
    const internalGap = firstButtonBox!.y - dropdownBox!.y;
    
    console.log(`Mobile - Internal gap: ${internalGap}px`);
    
    // Should still have breathing room on mobile (at least 15px)
    expect(internalGap).toBeGreaterThan(15);
    
    await page.screenshot({ 
      path: 'test-results/dropdown-spacing-mobile.png',
      fullPage: false 
    });
  });
});
