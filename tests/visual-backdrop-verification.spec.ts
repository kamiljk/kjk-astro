import { test, expect } from '@playwright/test';

test('visual verification of backdrop filter effect', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  
  // Take screenshot without dropdown
  await page.screenshot({ 
    path: 'screenshots/before-dropdown.png',
    fullPage: false 
  });
  
  // Open dropdown
  const dropdownButton = page.locator('[data-dropdown-trigger]');
  await dropdownButton.click();
  
  // Wait for dropdown animation
  await page.waitForTimeout(300);
  
  // Take screenshot with dropdown open
  await page.screenshot({ 
    path: 'screenshots/with-dropdown.png',
    fullPage: false 
  });
  
  // Check if dropdown is actually positioned over content
  const dropdown = page.locator('#filter-sort-menu.dropdown-visible');
  const dropdownBox = await dropdown.boundingBox();
  
  // Check if there's content underneath the dropdown
  const bodyContent = page.locator('main, article, .feed, .container');
  const contentBox = await bodyContent.first().boundingBox();
  
  console.log('Dropdown position:', dropdownBox);
  console.log('Content position:', contentBox);
  
  // Test if dropdown overlaps with content
  if (dropdownBox && contentBox) {
    const overlaps = !(dropdownBox.x + dropdownBox.width < contentBox.x || 
                     contentBox.x + contentBox.width < dropdownBox.x || 
                     dropdownBox.y + dropdownBox.height < contentBox.y || 
                     contentBox.y + contentBox.height < dropdownBox.y);
    
    console.log('Dropdown overlaps with content:', overlaps);
    expect(overlaps).toBe(true);
  }
  
  // Verify the backdrop filter is computed correctly
  const computedBackdrop = await dropdown.evaluate(el => {
    return window.getComputedStyle(el).backdropFilter;
  });
  
  console.log('Computed backdrop filter:', computedBackdrop);
  expect(computedBackdrop).toContain('blur');
});
