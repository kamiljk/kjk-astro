import { test, expect } from '@playwright/test';

test('verify backdrop filter visual effect', async ({ page }) => {
  await page.goto('/');
  
  // Take screenshot before dropdown
  await page.screenshot({ 
    path: 'screenshots/step1-before-dropdown.png',
    clip: { x: 0, y: 0, width: 1200, height: 400 }
  });
  
  // Open dropdown
  const dropdownButton = page.locator('[data-dropdown-trigger]');
  await dropdownButton.click();
  
  // Wait for dropdown animation
  await page.waitForTimeout(500);
  
  // Take screenshot with dropdown
  await page.screenshot({ 
    path: 'screenshots/step2-with-dropdown.png',
    clip: { x: 0, y: 0, width: 1200, height: 400 }
  });
  
  // Verify dropdown has correct styles
  const dropdown = page.locator('#filter-sort-menu.dropdown-visible');
  await expect(dropdown).toBeVisible();
  
  const styles = await dropdown.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      backdropFilter: computed.backdropFilter,
      background: computed.background,
      position: computed.position,
      top: computed.top,
      left: computed.left,
      right: computed.right
    };
  });
  
  console.log('Final dropdown styles:', styles);
  
  // The backdrop filter should blur content behind the dropdown
  expect(styles.backdropFilter).toContain('blur');
  expect(styles.position).toBe('absolute');
  
  console.log('Dropdown is now positioned relative to navbar container');
});
