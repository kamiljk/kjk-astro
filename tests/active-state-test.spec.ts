import { test, expect } from '@playwright/test';

test.describe('Active State Test', () => {
  test('verify button active states update correctly', async ({ page }) => {
    // Start with a clean state
    await page.goto('/?type=all');
    
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();
    
    // Wait for filter buttons to be visible
    await page.waitForSelector('.filter-btn[data-type="read"]', { state: 'visible' });
    
    console.log('=== Testing Filter Active States ===');
    
    // Check initial active state (should be "All")
    let activeButton = await page.locator('.filter-btn[data-active="true"]').textContent();
    console.log('Initial active filter:', activeButton?.trim());
    expect(activeButton?.trim()).toBe('All');
    
    // Click "Read" filter button
    const readButton = page.locator('.filter-btn[data-type="read"]');
    await readButton.click();
    await page.waitForTimeout(500);
    
    // Check active state updated to "Read"
    activeButton = await page.locator('.filter-btn[data-active="true"]').textContent();
    console.log('Active filter after Read click:', activeButton?.trim());
    expect(activeButton?.trim()).toBe('Read');
    
    // Verify dropdown is still open
    const dropdownExpanded = await dropdownTrigger.getAttribute('aria-expanded');
    console.log('Dropdown still open:', dropdownExpanded);
    expect(dropdownExpanded).toBe('true');
    
    // Click "Play" filter button
    const playButton = page.locator('.filter-btn[data-type="play"]');
    await playButton.click();
    await page.waitForTimeout(500);
    
    // Check active state updated to "Play"
    activeButton = await page.locator('.filter-btn[data-active="true"]').textContent();
    console.log('Active filter after Play click:', activeButton?.trim());
    expect(activeButton?.trim()).toBe('Play');
    
    console.log('=== Testing Sort Active States ===');
    
    // Test sort button active states
    let activeSortButton = await page.locator('.sort-btn[data-active="true"]').textContent();
    console.log('Initial active sort:', activeSortButton?.trim());
    // Don't assume the default, just check what it is
    const initialSort = activeSortButton?.trim();
    
    // Click "Created" sort button (only if it's not already active)
    const createdSortButton = page.locator('.sort-btn[data-sort="created"]');
    if (initialSort !== 'Created') {
      await createdSortButton.click();
      await page.waitForTimeout(500);
    }
    
    // Check sort active state updated
    activeSortButton = await page.locator('.sort-btn[data-active="true"]').textContent();
    console.log('Active sort after Created click:', activeSortButton?.trim());
    expect(activeSortButton?.trim()).toBe('Created');
    
    // Click "A-Z" sort button
    const alphaSortButton = page.locator('.sort-btn[data-sort="alpha"]');
    await alphaSortButton.click();
    await page.waitForTimeout(500);
    
    // Check sort active state updated
    activeSortButton = await page.locator('.sort-btn[data-active="true"]').textContent();
    console.log('Active sort after A-Z click:', activeSortButton?.trim());
    expect(activeSortButton?.trim()).toBe('A-Z');
    
    console.log('=== Testing Order Active States ===');
    
    // Switch back to a sort that shows order buttons
    const updatedSortButton = page.locator('.sort-btn[data-sort="updated"]');
    await updatedSortButton.click();
    await page.waitForTimeout(500);
    
    // Test order button active states
    let activeOrderButton = await page.locator('.order-btn[data-active="true"]').textContent();
    console.log('Initial active order:', activeOrderButton?.trim());
    expect(activeOrderButton?.trim()).toBe('↓'); // Default is desc
    
    // Click ascending order button
    const ascOrderButton = page.locator('.order-btn[data-order="asc"]');
    await ascOrderButton.click();
    await page.waitForTimeout(500);
    
    // Check order active state updated
    activeOrderButton = await page.locator('.order-btn[data-active="true"]').textContent();
    console.log('Active order after asc click:', activeOrderButton?.trim());
    expect(activeOrderButton?.trim()).toBe('↑');
    
    // Click descending order button
    const descOrderButton = page.locator('.order-btn[data-order="desc"]');
    await descOrderButton.click();
    await page.waitForTimeout(500);
    
    // Check order active state updated
    activeOrderButton = await page.locator('.order-btn[data-active="true"]').textContent();
    console.log('Active order after desc click:', activeOrderButton?.trim());
    expect(activeOrderButton?.trim()).toBe('↓');
    
    console.log('✅ All active states update correctly and dropdown persists!');
  });
});
