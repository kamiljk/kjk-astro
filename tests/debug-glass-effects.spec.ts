import { test } from '@playwright/test';

test('debug liquid glass effect application', async ({ page }) => {
  await page.goto('/');
  
  // Check navbar glass effect
  const navbar = page.locator('.liquid-glass-navbar');
  const navbarStyles = await navbar.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      background: computed.background,
      backdropFilter: computed.backdropFilter,
      border: computed.border,
      boxShadow: computed.boxShadow,
      className: el.className
    };
  });
  
  console.log('=== NAVBAR STYLES ===');
  console.log('Classes:', navbarStyles.className);
  console.log('Background:', navbarStyles.background);
  console.log('Backdrop Filter:', navbarStyles.backdropFilter);
  console.log('Border:', navbarStyles.border);
  console.log('Box Shadow:', navbarStyles.boxShadow);
  
  // Open dropdown
  const dropdownButton = page.locator('[data-dropdown-trigger]');
  await dropdownButton.click();
  await page.waitForTimeout(300);
  
  // Check dropdown glass effect
  const dropdown = page.locator('#filter-sort-menu');
  const dropdownStyles = await dropdown.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      background: computed.background,
      backdropFilter: computed.backdropFilter,
      border: computed.border,
      boxShadow: computed.boxShadow,
      className: el.className,
      opacity: computed.opacity,
      visibility: computed.visibility
    };
  });
  
  console.log('=== DROPDOWN STYLES ===');
  console.log('Classes:', dropdownStyles.className);
  console.log('Background:', dropdownStyles.background);
  console.log('Backdrop Filter:', dropdownStyles.backdropFilter);
  console.log('Border:', dropdownStyles.border);
  console.log('Box Shadow:', dropdownStyles.boxShadow);
  console.log('Opacity:', dropdownStyles.opacity);
  console.log('Visibility:', dropdownStyles.visibility);
});
