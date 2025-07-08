import { test, expect } from '@playwright/test';

test.describe('Debug Navbar Structure', () => {
  test('check actual navbar elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Log all header elements
    const headers = await page.locator('header').all();
    console.log('Number of header elements:', headers.length);
    
    for (let i = 0; i < headers.length; i++) {
      const className = await headers[i].getAttribute('class');
      const id = await headers[i].getAttribute('id');
      console.log(`Header ${i}: class="${className}", id="${id}"`);
    }
    
    // Check for navbar-horizontal specifically
    const navbarHorizontal = page.locator('.navbar-horizontal');
    const exists = await navbarHorizontal.count();
    console.log('navbar-horizontal elements:', exists);
    
    if (exists > 0) {
      const className = await navbarHorizontal.getAttribute('class');
      console.log('navbar-horizontal class:', className);
    }
    
    // Check for dropdown trigger
    const dropdownTrigger = page.locator('#dropdown-trigger');
    const triggerExists = await dropdownTrigger.count();
    console.log('dropdown-trigger elements:', triggerExists);
    
    if (triggerExists > 0) {
      console.log('dropdown-trigger is visible:', await dropdownTrigger.isVisible());
    }
  });
});
