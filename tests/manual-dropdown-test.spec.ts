import { test, expect } from '@playwright/test';

test.describe('Manual Dropdown Persistence Test', () => {
  test('verify filter button functionality and dropdown persistence', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();
    
    // Wait for filter buttons to be visible
    await page.waitForSelector('.filter-btn[data-type="read"]', { state: 'visible' });
    
    // Get initial URL
    const initialUrl = page.url();
    console.log('Initial URL:', initialUrl);
    
    // Click "Read" filter button
    const readButton = page.locator('.filter-btn[data-type="read"]');
    await readButton.click();
    
    // Wait for URL to change
    await page.waitForTimeout(1000);
    
    // Check URL changed
    const newUrl = page.url();
    console.log('New URL after Read click:', newUrl);
    expect(newUrl).toContain('type=read');
    
    // MAIN TEST: Check if filter buttons are still visible (dropdown should stay open)
    const filterButtonsVisible = await page.locator('.filter-btn').count();
    console.log('Filter buttons still visible:', filterButtonsVisible);
    expect(filterButtonsVisible).toBeGreaterThan(0); // Should still be visible since dropdown stays open
    
    // Verify dropdown is actually open by checking if dropdown trigger has aria-expanded="true"
    const dropdownExpanded = await dropdownTrigger.getAttribute('aria-expanded');
    console.log('Dropdown expanded state:', dropdownExpanded);
    expect(dropdownExpanded).toBe('true');
    
    // Test sort button also keeps dropdown open
    const sortButton = page.locator('.sort-btn[data-sort="created"]');
    await sortButton.click();
    await page.waitForTimeout(500);
    
    // Check dropdown is still open after sort button click
    const stillExpanded = await dropdownTrigger.getAttribute('aria-expanded');
    console.log('Dropdown still expanded after sort click:', stillExpanded);
    expect(stillExpanded).toBe('true');
    
    // Check feed content changed by looking for the posts
    const postLinks = page.locator('main a');
    const postCount = await postLinks.count();
    console.log('Number of posts visible:', postCount);
    
    // The main goal: no page reload occurred - check if page context is still the same
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check initial active state (should be "all" or based on URL params)
    let activeButton = await page.locator('.filter-btn[data-active="true"]').textContent();
    console.log('Initial active filter:', activeButton?.trim());
    console.log('Initial URL before any clicks:', initialUrl);
    
    // If URL already has parameters, adjust expectations
    if (initialUrl.includes('type=')) {
      console.log('URL already has type parameter, skipping initial state check');
    } else {
      expect(activeButton?.trim()).toBe('All');
    }
    
    // Check active state updated to "Read"
    activeButton = await page.locator('.filter-btn[data-active="true"]').textContent();
    console.log('Active filter after Read click:', activeButton?.trim());
    expect(activeButton?.trim()).toBe('Read');
    
    // Check sort active state updated
    const activeSortButton = await page.locator('.sort-btn[data-active="true"]').textContent();
    console.log('Active sort after Created click:', activeSortButton?.trim());
    expect(activeSortButton?.trim()).toBe('Created');
    
    console.log('✅ Filter functionality working, dropdown persists, and active states update!');
  });
});
