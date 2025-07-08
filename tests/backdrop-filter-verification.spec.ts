import { test, expect } from '@playwright/test';

test('verify backdrop filter is working correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check navbar backdrop filter
  const navbar = page.locator('.liquid-glass-navbar');
  await expect(navbar).toBeVisible();
  
  const navbarStyles = await navbar.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      backdropFilter: style.backdropFilter,
      background: style.background,
      opacity: style.opacity
    };
  });
  
  console.log('Navbar styles:', navbarStyles);
  expect(navbarStyles.backdropFilter).toContain('blur');
  
  // Open dropdown and check its backdrop filter
  const dropdownButton = page.locator('[data-dropdown-trigger]');
  await dropdownButton.click();
  
  const dropdown = page.locator('#filter-sort-menu.dropdown-visible');
  await expect(dropdown).toBeVisible();
  
  const dropdownStyles = await dropdown.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      backdropFilter: style.backdropFilter,
      background: style.background,
      position: style.position,
      zIndex: style.zIndex,
      opacity: style.opacity
    };
  });
  
  console.log('Dropdown styles:', dropdownStyles);
  expect(dropdownStyles.backdropFilter).toContain('blur');
  
  // Check if dropdown is actually blurring content behind it
  // Take a screenshot to manually verify
  await page.screenshot({ path: 'dropdown-backdrop-test.png' });
});
