import { test } from '@playwright/test';

test('debug backdrop-filter rendering issues', async ({ page }) => {
  await page.goto('/');
  
  // Check if backdrop-filter is actually supported
  const supportsBackdropFilter = await page.evaluate(() => {
    return CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  });
  
  console.log('Browser supports backdrop-filter:', supportsBackdropFilter);
  
  // Open dropdown
  await page.locator('[data-dropdown-trigger]').click();
  const dropdown = page.locator('#filter-sort-menu.dropdown-visible');
  
  // Get detailed computed styles
  const detailedStyles = await dropdown.evaluate(el => {
    const computed = window.getComputedStyle(el);
    
    return {
      element: {
        backdropFilter: computed.backdropFilter,
        background: computed.background,
        isolation: computed.isolation,
        willChange: computed.willChange,
        transform: computed.transform,
        zIndex: computed.zIndex,
        position: computed.position,
        mixBlendMode: computed.mixBlendMode
      }
    };
  });
  
  console.log('Detailed styles:', JSON.stringify(detailedStyles, null, 2));
  
  // Test a simple backdrop-filter element to verify browser support
  await page.addStyleTag({
    content: `
      .test-backdrop {
        position: fixed;
        top: 200px;
        left: 200px;
        width: 200px;
        height: 200px;
        background: rgba(255, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 9999;
        border: 2px solid red;
      }
    `
  });
  
  await page.evaluate(() => {
    const testDiv = document.createElement('div');
    testDiv.className = 'test-backdrop';
    testDiv.textContent = 'TEST BLUR';
    document.body.appendChild(testDiv);
  });
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'backdrop-debug.png', fullPage: true });
});
