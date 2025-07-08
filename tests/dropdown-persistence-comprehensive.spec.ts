import { test, expect } from '@playwright/test';

test.describe('Comprehensive Dropdown Persistence Test', () => {
  test('all buttons should keep dropdown open', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();
    
    // Wait for dropdown to be fully open
    await page.waitForSelector('.filter-btn[data-type="read"]', { state: 'visible' });
    
    console.log('=== Testing Filter Buttons ===');
    
    // Test filter buttons
    const filterButtons = [
      { selector: '.filter-btn[data-type="read"]', name: 'Read' },
      { selector: '.filter-btn[data-type="play"]', name: 'Play' },
      { selector: '.filter-btn[data-type="about"]', name: 'About' }
    ];
    
    for (const btn of filterButtons) {
      console.log(`Testing ${btn.name} filter button...`);
      await page.locator(btn.selector).click();
      await page.waitForTimeout(500);
      
      const isExpanded = await dropdownTrigger.getAttribute('aria-expanded');
      console.log(`${btn.name} button - Dropdown expanded: ${isExpanded}`);
      expect(isExpanded).toBe('true');
    }
    
    console.log('=== Testing Sort Buttons ===');
    
    // Test sort buttons
    const sortButtons = [
      { selector: '.sort-btn[data-sort="created"]', name: 'Created' },
      { selector: '.sort-btn[data-sort="alpha"]', name: 'A-Z' },
      { selector: '.sort-btn[data-sort="updated"]', name: 'Updated' }
    ];
    
    for (const btn of sortButtons) {
      console.log(`Testing ${btn.name} sort button...`);
      await page.locator(btn.selector).click();
      await page.waitForTimeout(500);
      
      const isExpanded = await dropdownTrigger.getAttribute('aria-expanded');
      console.log(`${btn.name} button - Dropdown expanded: ${isExpanded}`);
      expect(isExpanded).toBe('true');
    }
    
    console.log('=== Testing Order Buttons ===');
    
    // Switch to a sort mode that shows order buttons
    await page.locator('.sort-btn[data-sort="updated"]').click();
    await page.waitForTimeout(500);
    
    // Test order buttons
    const orderButtons = [
      { selector: '.order-btn[data-order="asc"]', name: 'Ascending' },
      { selector: '.order-btn[data-order="desc"]', name: 'Descending' }
    ];
    
    for (const btn of orderButtons) {
      console.log(`Testing ${btn.name} order button...`);
      await page.locator(btn.selector).click();
      await page.waitForTimeout(500);
      
      const isExpanded = await dropdownTrigger.getAttribute('aria-expanded');
      console.log(`${btn.name} button - Dropdown expanded: ${isExpanded}`);
      expect(isExpanded).toBe('true');
    }
    
    console.log('=== Testing Theme Toggle Button ===');
    
    // Test theme toggle button
    await page.locator('.theme-wrapper button').click();
    await page.waitForTimeout(500);
    
    const isExpandedAfterTheme = await dropdownTrigger.getAttribute('aria-expanded');
    console.log(`Theme toggle - Dropdown expanded: ${isExpandedAfterTheme}`);
    expect(isExpandedAfterTheme).toBe('true');
    
    console.log('✅ All buttons keep dropdown open successfully!');
  });
  
  test('dropdown closes when pressing escape', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();
    
    // Wait for dropdown to be open
    await page.waitForSelector('.filter-btn[data-type="read"]', { state: 'visible' });
    
    // Verify dropdown is open
    let isExpanded = await dropdownTrigger.getAttribute('aria-expanded');
    expect(isExpanded).toBe('true');
    
    // Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Verify dropdown is now closed
    isExpanded = await dropdownTrigger.getAttribute('aria-expanded');
    console.log(`After pressing Escape - Dropdown expanded: ${isExpanded}`);
    expect(isExpanded).toBe('false');
    
    console.log('✅ Dropdown correctly closes when pressing Escape!');
  });
});
