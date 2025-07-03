import { test, expect } from '@playwright/test';

test('verify accent color system', async ({ page }) => {
  await page.goto('/');
  
  // Wait for random color system to initialize
  await page.waitForTimeout(1000);
  
  // Check if random color is set
  const accentColor = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      accent: root.style.getPropertyValue('--color-accent') || getComputedStyle(root).getPropertyValue('--color-accent'),
      accentHover: root.style.getPropertyValue('--color-accent-hover') || getComputedStyle(root).getPropertyValue('--color-accent-hover'),
      accentActive: root.style.getPropertyValue('--color-accent-active') || getComputedStyle(root).getPropertyValue('--color-accent-active'),
      accentText: root.style.getPropertyValue('--color-accent-text') || getComputedStyle(root).getPropertyValue('--color-accent-text'),
    };
  });
  
  console.log('Current accent colors:', accentColor);
  
  // Check localStorage for saved colors
  const savedColors = await page.evaluate(() => {
    return {
      savedAccent: localStorage.getItem('accent-color'),
      savedRgb: localStorage.getItem('accent-color-rgb')
    };
  });
  
  console.log('Saved colors in localStorage:', savedColors);
  
  // Open dropdown
  const menuBtn = page.locator('.nav__menu-btn');
  await menuBtn.click();
  await page.waitForTimeout(500);
  
  // Check if dropdown buttons have correct color variables
  const dropdown = page.locator('[class*="menuContent"]');
  await expect(dropdown).toBeVisible();
  
  // Check menu button colors
  const menuBtnColors = await menuBtn.evaluate(el => {
    const styles = getComputedStyle(el);
    return {
      background: styles.backgroundColor,
      border: styles.borderColor,
      color: styles.color
    };
  });
  
  console.log('Menu button colors:', menuBtnColors);
  
  // Check dropdown pill colors
  const pills = page.locator('[class*="pill"]');
  const pillCount = await pills.count();
  console.log(`Found ${pillCount} pills`);
  
  if (pillCount > 0) {
    const pillColors = await pills.first().evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        border: styles.borderColor,
        color: styles.color
      };
    });
    
    console.log('Pill colors:', pillColors);
    
    // Hover over pill to check hover colors
    await pills.first().hover();
    await page.waitForTimeout(200);
    
    const pillHoverColors = await pills.first().evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        border: styles.borderColor,
        color: styles.color
      };
    });
    
    console.log('Pill hover colors:', pillHoverColors);
  }
  
  // Check theme button colors
  const themeBtn = page.locator('[class*="themeButton"]');
  const themeBtnExists = await themeBtn.count();
  console.log(`Found ${themeBtnExists} theme buttons`);
  
  if (themeBtnExists > 0) {
    const themeBtnColors = await themeBtn.first().evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        border: styles.borderColor,
        color: styles.color
      };
    });
    
    console.log('Theme button colors:', themeBtnColors);
  }
  
  await page.screenshot({ path: 'test-results/color-system-test.png' });
});
