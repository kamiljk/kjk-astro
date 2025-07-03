import { test, expect } from '@playwright/test';

test('debug medium viewport layout', async ({ page }) => {
  await page.setViewportSize({ width: 750, height: 900 });
  await page.goto('/');
  
  await page.waitForTimeout(1000);
  
  const menuBtn = page.locator('.nav__menu-btn');
  await menuBtn.click();
  
  await page.waitForTimeout(500);
  
  const dropdown = page.locator('[class*="menuContent"]');
  await expect(dropdown).toBeVisible();
  
  // Check dropdown computed styles
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
  
  console.log('Medium viewport dropdown styles:', dropdownStyles);
  
  const sections = page.locator('section[class*="section"]');
  const sectionCount = await sections.count();
  console.log(`Found ${sectionCount} sections`);
  
  // Get detailed section info
  for (let i = 0; i < sectionCount; i++) {
    const section = sections.nth(i);
    const box = await section.boundingBox();
    const label = await section.locator('[class*="sectionLabel"]').first().textContent();
    
    // Get computed styles for each section
    const sectionStyles = await section.evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        flex: styles.flex,
        flexBasis: styles.flexBasis,
        flexGrow: styles.flexGrow,
        flexShrink: styles.flexShrink,
        minWidth: styles.minWidth,
        width: styles.width,
        justifyContent: styles.justifyContent
      };
    });
    
    console.log(`Section ${i + 1} (${label}):`, {
      position: { x: box?.x, y: box?.y, w: box?.width, h: box?.height },
      styles: sectionStyles
    });
  }
  
  await page.screenshot({ path: 'test-results/debug-medium-viewport.png' });
});
