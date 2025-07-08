import { test } from '@playwright/test';

test('inspect dropdown classes in console', async ({ page }) => {
  await page.goto('/');
  
  const dropdownButton = page.locator('[data-dropdown-trigger]');
  const dropdown = page.locator('#filter-sort-menu');
  
  console.log('=== DROPDOWN STATE INSPECTION ===');
  
  // Check initial state
  const initialClasses = await dropdown.getAttribute('class');
  const initialHidden = await dropdown.getAttribute('hidden');
  console.log('Initial classes:', initialClasses);
  console.log('Initially hidden:', initialHidden !== null);
  
  // Open dropdown
  await dropdownButton.click();
  await page.waitForTimeout(300); // Wait for transition
  
  // Check opened state
  const openClasses = await dropdown.getAttribute('class');
  const openHidden = await dropdown.getAttribute('hidden');
  const computedStyle = await dropdown.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      opacity: style.opacity,
      transform: style.transform,
      visibility: style.visibility,
      backdropFilter: style.backdropFilter
    };
  });
  
  console.log('Opened classes:', openClasses);
  console.log('Opened hidden attr:', openHidden);
  console.log('Computed style:', computedStyle);
  
  // Close dropdown
  await page.click('body');
  await page.waitForTimeout(300);
  
  // Check closed state
  const closedClasses = await dropdown.getAttribute('class');
  const closedHidden = await dropdown.getAttribute('hidden');
  console.log('Closed classes:', closedClasses);
  console.log('Finally hidden:', closedHidden !== null);
});
