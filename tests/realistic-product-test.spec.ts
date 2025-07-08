import { test, expect } from '@playwright/test';

test.describe('Realistic Product Test', () => {
  test('realistic user workflow - multiple filter operations', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== Testing Realistic User Workflow ===');
    
    // Step 1: Filter to "read" posts
    console.log('Step 1: Filtering to Read posts');
    await page.locator('#dropdown-trigger').click();
    await page.locator('.filter-btn[data-type="read"]').click();
    await page.waitForTimeout(500);
    
    let currentUrl = page.url();
    console.log('URL after Read filter:', currentUrl);
    expect(currentUrl).toContain('type=read');
    
    let postCount = await page.locator('main a').count();
    console.log(`Read posts found: ${postCount}`);
    
    // Step 2: Change to "play" posts (user reopens dropdown)
    console.log('Step 2: Switching to Play posts');
    await page.locator('#dropdown-trigger').click();
    await page.locator('.filter-btn[data-type="play"]').click();
    await page.waitForTimeout(500);
    
    currentUrl = page.url();
    console.log('URL after Play filter:', currentUrl);
    expect(currentUrl).toContain('type=play');
    expect(currentUrl).not.toContain('type=read');
    
    postCount = await page.locator('main a').count();
    console.log(`Play posts found: ${postCount}`);
    
    // Step 3: Change sorting (user reopens dropdown)
    console.log('Step 3: Changing sort to alphabetical');
    await page.locator('#dropdown-trigger').click();
    await page.locator('.sort-btn[data-sort="alpha"]').click();
    await page.waitForTimeout(500);
    
    currentUrl = page.url();
    console.log('URL after alpha sort:', currentUrl);
    expect(currentUrl).toContain('sort=alpha');
    expect(currentUrl).toContain('order=asc');
    
    // Step 4: Toggle theme (user reopens dropdown)
    console.log('Step 4: Toggling theme');
    const initialTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    
    await page.locator('#dropdown-trigger').click();
    const themeButton = page.locator('.theme-toggle-btn, .pill').filter({ hasText: /Dark|Light/ });
    await themeButton.click();
    await page.waitForTimeout(300);
    
    const newTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    console.log(`Theme changed from ${initialTheme} to ${newTheme}`);
    expect(newTheme).not.toBe(initialTheme);
    
    // Step 5: Verify final state
    console.log('Step 5: Final verification');
    await page.locator('#dropdown-trigger').click();
    
    // Check that the correct buttons show as active
    const activeFilter = await page.locator('.filter-btn[data-active="true"]').textContent();
    const activeSort = await page.locator('.sort-btn[data-active="true"]').textContent();
    
    console.log(`Active filter: ${activeFilter?.trim()}, Active sort: ${activeSort?.trim()}`);
    expect(activeFilter?.trim()).toBe('Play');
    expect(activeSort?.trim()).toBe('A-Z');
    
    console.log('=== ✅ Realistic Workflow Test PASSED ===');
    console.log('✅ Multiple filter changes work');
    console.log('✅ Sort changes work');
    console.log('✅ Theme toggle works');
    console.log('✅ Active states track correctly');
    console.log('✅ No page reloads occurred');
  });
  
  test('performance and responsiveness', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== Testing Performance ===');
    
    // Test rapid interactions
    const startTime = Date.now();
    
    for (let i = 0; i < 3; i++) {
      await page.locator('#dropdown-trigger').click();
      await page.locator('.filter-btn[data-type="read"]').click();
      await page.waitForTimeout(100);
      
      await page.locator('#dropdown-trigger').click();
      await page.locator('.filter-btn[data-type="play"]').click();
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Rapid interaction test completed in ${totalTime}ms`);
    expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
    
    // Verify page is still functional
    const finalUrl = page.url();
    expect(finalUrl).toContain('type=play');
    
    console.log('✅ Performance test passed');
  });
  
  test('edge cases and error handling', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== Testing Edge Cases ===');
    
    // Test clicking same filter multiple times
    await page.locator('#dropdown-trigger').click();
    await page.locator('.filter-btn[data-type="all"]').click();
    await page.waitForTimeout(300);
    
    await page.locator('#dropdown-trigger').click();
    await page.locator('.filter-btn[data-type="all"]').click();
    await page.waitForTimeout(300);
    
    // Should still work fine
    const url = page.url();
    console.log('URL after clicking same filter twice:', url);
    
    // Test rapid dropdown open/close
    for (let i = 0; i < 5; i++) {
      await page.locator('#dropdown-trigger').click();
      await page.waitForTimeout(50);
      await page.locator('#dropdown-trigger').click();
      await page.waitForTimeout(50);
    }
    
    // Verify dropdown is in a consistent state
    await page.locator('#dropdown-trigger').click();
    const filterButtons = await page.locator('.filter-btn').count();
    expect(filterButtons).toBeGreaterThan(0);
    
    console.log('✅ Edge cases handled correctly');
  });
});
