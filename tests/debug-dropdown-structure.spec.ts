import { test, expect } from '@playwright/test';

test.describe('Debug Dropdown Structure', () => {
  test('inspect dropdown elements', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    const menuBtn = page.locator('.nav__menu-btn');
    await menuBtn.click();
    
    await page.waitForTimeout(500);
    
    // Check what sections exist
    const allSections = page.locator('[class*="section"]');
    const sectionCount = await allSections.count();
    console.log(`Total sections found: ${sectionCount}`);
    
    for (let i = 0; i < sectionCount; i++) {
      const section = allSections.nth(i);
      const className = await section.getAttribute('class');
      const isVisible = await section.isVisible();
      const box = await section.boundingBox();
      
      console.log(`Section ${i}:`, {
        className,
        isVisible,
        x: box?.x,
        y: box?.y,
        width: box?.width,
        height: box?.height
      });
      
      // Try to find labels within each section
      const labels = section.locator('[class*="sectionLabel"], [class*="section-label"], h3, .sectionLabel');
      const labelCount = await labels.count();
      
      if (labelCount > 0) {
        for (let j = 0; j < labelCount; j++) {
          const label = labels.nth(j);
          const labelText = await label.textContent();
          const labelClass = await label.getAttribute('class');
          console.log(`  Label ${j}: "${labelText}" (class: ${labelClass})`);
        }
      } else {
        console.log(`  No labels found in section ${i}`);
      }
      
      // Check for buttons in each section
      const buttons = section.locator('button');
      const buttonCount = await buttons.count();
      console.log(`  Buttons in section ${i}: ${buttonCount}`);
    }
    
    // Check the dropdown structure
    const dropdown = page.locator('[class*="menuContent"]');
    const dropdownHTML = await dropdown.innerHTML();
    console.log('Dropdown HTML structure:');
    console.log(dropdownHTML.substring(0, 500) + '...');
    
    await page.screenshot({ path: 'test-results/dropdown-debug-structure.png' });
  });
});
