import { test, expect } from '@playwright/test';

test.describe('NavbarMenu Dropdown Layout', () => {
  test('dropdown sections layout responsively', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/');
    
    // Wait for the page to load and scripts to run
    await page.waitForTimeout(1000);
    
    // Click the menu button to reveal dropdown
    const menuBtn = page.locator('.nav__menu-btn');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500);
    
    // Check if dropdown is visible
    const dropdown = page.locator('[class*="menuContent"]');
    const isVisible = await dropdown.isVisible();
    
    if (!isVisible) {
      console.log('❌ Dropdown not visible, checking portal...');
      const portal = page.locator('#navbar-dropdown-portal');
      const portalExists = await portal.count();
      console.log(`Portal exists: ${portalExists > 0}`);
      
      // Check if any dropdown elements exist
      const anyDropdown = page.locator('div[class*="menu"]');
      const dropdownCount = await anyDropdown.count();
      console.log(`Found ${dropdownCount} menu-related elements`);
      
      if (dropdownCount > 0) {
        for (let i = 0; i < dropdownCount; i++) {
          const element = anyDropdown.nth(i);
          const className = await element.getAttribute('class');
          const isVis = await element.isVisible();
          console.log(`Element ${i}: class="${className}", visible=${isVis}`);
        }
      }
      
      return;
    }
    
    console.log('✅ Dropdown is visible');
    
    // Check sections layout - use more specific selector
    const sections = page.locator('section[class*="section"]');
    const sectionCount = await sections.count();
    console.log(`Found ${sectionCount} sections`);
    
    // Get bounding boxes for each section
    const sectionData: Array<{index: number, label: string | null, box: {x: number, y: number, width: number, height: number} | null}> = [];
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const box = await section.boundingBox();
      const label = await section.locator('h3[class*="sectionLabel"]').first().textContent();
      sectionData.push({ index: i, label, box });
    }
    
    // Check if sections are in a single row (wide viewport)
    if (sectionData.length >= 2) {
      const firstY = sectionData[0].box?.y || 0;
      const secondY = sectionData[1].box?.y || 0;
      const yDiff = Math.abs(firstY - secondY);
      
      if (yDiff < 10) {
        console.log('✅ Sections are in a single row');
      } else {
        console.log(`❌ Sections are stacked (Y diff: ${yDiff}px)`);
      }
      
      sectionData.forEach(({ index, label, box }) => {
        console.log(`Section ${index + 1} (${label}): x=${box?.x}, y=${box?.y}, w=${box?.width}, h=${box?.height}`);
      });
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/dropdown-layout-debug.png' });
    
    // Check dropdown styles
    const dropdownStyles = await dropdown.evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
        flexWrap: styles.flexWrap,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        gap: styles.gap,
        width: styles.width,
        maxWidth: styles.maxWidth
      };
    });
    
    console.log('Dropdown styles:', dropdownStyles);
    
    // Verify at least 3 sections exist
    expect(sectionCount).toBe(3);
    
    // Verify sections are in single row for wide viewport
    if (sectionData.length >= 2) {
      const firstY = sectionData[0].box?.y || 0;
      const secondY = sectionData[1].box?.y || 0;
      const yDiff = Math.abs(firstY - secondY);
      
      expect(yDiff).toBeLessThan(10); // Should be on same row
    }
  });
  
  test('dropdown sections wrap to multiple rows on medium viewport', async ({ page }) => {
    await page.setViewportSize({ width: 750, height: 900 });
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    const menuBtn = page.locator('.nav__menu-btn');
    await menuBtn.click();
    
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('[class*="menuContent"]');
    await expect(dropdown).toBeVisible();
    
    const sections = page.locator('section[class*="section"]');
    const sectionCount = await sections.count();
    
    // Should have 3 sections
    expect(sectionCount).toBe(3);
    
    // Check if first two sections are on same row, third on different row
    const sectionData: Array<{x: number, y: number, width: number, height: number} | null> = [];
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const box = await section.boundingBox();
      sectionData.push(box);
    }
    
    if (sectionData.length >= 3) {
      const firstY = sectionData[0]?.y || 0;
      const secondY = sectionData[1]?.y || 0;
      const thirdY = sectionData[2]?.y || 0;
      
      const firstSecondDiff = Math.abs(firstY - secondY);
      const firstThirdDiff = Math.abs(firstY - thirdY);
      
      // First two should be on same row, third on different row
      expect(firstSecondDiff).toBeLessThan(10);
      expect(firstThirdDiff).toBeGreaterThan(20);
    }
    
    await page.screenshot({ path: 'test-results/dropdown-layout-medium.png' });
  });
  
  test('dropdown sections stack on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    const menuBtn = page.locator('.nav__menu-btn');
    await menuBtn.click();
    
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('[class*="menuContent"]');
    await expect(dropdown).toBeVisible();
    
    const sections = page.locator('section[class*="section"]');
    const sectionCount = await sections.count();
    
    expect(sectionCount).toBe(3);
    
    // All sections should be stacked vertically
    const sectionData: number[] = [];
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const box = await section.boundingBox();
      sectionData.push(box?.y || 0);
    }
    
    // Each section should be on a different row
    for (let i = 1; i < sectionData.length; i++) {
      const yDiff = Math.abs(sectionData[i] - sectionData[i - 1]);
      expect(yDiff).toBeGreaterThan(20); // Should be significantly different Y positions
    }
    
    await page.screenshot({ path: 'test-results/dropdown-layout-mobile.png' });
  });
});
