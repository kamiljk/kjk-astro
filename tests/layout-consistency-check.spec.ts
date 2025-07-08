import { test, expect } from '@playwright/test';

test('verify dropdown layout consistency with navbar', async ({ page }) => {
  await page.goto('/');
  
  // Get navbar container width and positioning
  const navbar = page.locator('.site-header-inner');
  const navbarBox = await navbar.boundingBox();
  
  // Open dropdown
  await page.locator('[data-dropdown-trigger]').click();
  await page.waitForTimeout(300);
  
  // Get dropdown positioning
  const dropdown = page.locator('#filter-sort-menu.dropdown-visible');
  const dropdownBox = await dropdown.boundingBox();
  
  console.log('Navbar container:', navbarBox);
  console.log('Dropdown container:', dropdownBox);
  
  // Check if dropdown is centered and constrained like navbar
  if (navbarBox && dropdownBox) {
    const navbarCenter = navbarBox.x + (navbarBox.width / 2);
    const dropdownCenter = dropdownBox.x + (dropdownBox.width / 2);
    const centerDiff = Math.abs(navbarCenter - dropdownCenter);
    
    console.log('Navbar center:', navbarCenter);
    console.log('Dropdown center:', dropdownCenter);
    console.log('Center difference:', centerDiff);
    
    // Should be centered within a reasonable tolerance
    expect(centerDiff).toBeLessThan(50);
    
    // Dropdown should not be significantly wider than navbar
    const widthRatio = dropdownBox.width / navbarBox.width;
    console.log('Width ratio (dropdown/navbar):', widthRatio);
    expect(widthRatio).toBeLessThanOrEqual(1.2); // Allow some reasonable difference
  }
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'screenshots/final-consistency-check.png',
    clip: { x: 0, y: 0, width: 1280, height: 400 }
  });
  
  // Verify backdrop filter is still working
  const styles = await dropdown.evaluate(el => {
    return window.getComputedStyle(el).backdropFilter;
  });
  
  expect(styles).toContain('blur');
  console.log('Backdrop filter confirmed:', styles);
});
