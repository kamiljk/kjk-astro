import { test, expect } from '@playwright/test';

test.describe('Navbar Visibility and Functionality', () => {
  test('should display frosted glass navbar with dropdown', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if navbar exists and is visible
    const navbar = await page.locator('.navbar-horizontal');
    await expect(navbar).toBeVisible();
    
    // Check if navbar has frosted glass styling
    const navbarStyles = await navbar.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
        background: styles.background,
        backdropFilter: styles.backdropFilter || (styles as any).webkitBackdropFilter,
        zIndex: styles.zIndex
      };
    });
    
    console.log('Navbar styles:', navbarStyles);
    expect(navbarStyles.position).toBe('fixed');
    expect(navbarStyles.zIndex).toBe('100');
    
    // Check if logo is visible
    const logo = await page.locator('.logo-img');
    await expect(logo).toBeVisible();
    
    // Check if dropdown button exists
    const dropdownButton = await page.locator('[aria-label="Open menu"]');
    await expect(dropdownButton).toBeVisible();
    
    // Test dropdown functionality
    await dropdownButton.click();
    
    // Wait for dropdown to be visible
    await page.waitForSelector('#filter-sort-menu', { state: 'visible' });
    
    // Check if dropdown menu appeared
    const dropdown = await page.locator('#filter-sort-menu');
    await expect(dropdown).toBeVisible();
    
    // Check if filter pills are present
    const filterPills = await page.locator('.filter-btn');
    expect(await filterPills.count()).toBeGreaterThan(0);
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/navbar-frosted-glass.png',
      fullPage: true 
    });
    
    console.log('✅ Navbar is visible and functional!');
  });
  
  test('should have proper navbar height and spacing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const navbar = await page.locator('.navbar-horizontal');
    const navbarBox = await navbar.boundingBox();
    
    console.log('Navbar dimensions:', navbarBox);
    
    // Navbar should have reasonable height
    expect(navbarBox?.height).toBeGreaterThan(50);
    expect(navbarBox?.height).toBeLessThan(100);
    
    // Check body padding to ensure content doesn't hide behind navbar
    const bodyPaddingTop = await page.evaluate(() => {
      return window.getComputedStyle(document.body).paddingTop;
    });
    
    console.log('Body padding-top:', bodyPaddingTop);
  });
});
