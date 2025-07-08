import { test } from '@playwright/test';

test('Debug button hover states', async ({ page }) => {
  await page.goto('/');
  
  // Open dropdown
  const dropdownTrigger = page.locator('#dropdown-trigger');
  await dropdownTrigger.click();

  // Get an inactive button
  const inactiveButton = page.locator('.filter-btn[data-active="false"]').first();
  
  // Check computed token values
  const tokenValues = await page.evaluate(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
      buttonBgHover: computedStyle.getPropertyValue('--button-bg-hover').trim(),
      colorAccent: computedStyle.getPropertyValue('--color-accent').trim(),
      buttonBgInactive: computedStyle.getPropertyValue('--button-bg-inactive').trim(),
    };
  });
  
  console.log('CSS Token Values:', tokenValues);
  
  // Check button's computed styles before hover
  const beforeHover = await inactiveButton.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      background: style.background,
      color: style.color,
      borderColor: style.borderColor
    };
  });
  
  console.log('Before hover:', beforeHover);
  
  // Hover the button
  await inactiveButton.hover();
  
  // Check button's computed styles during hover
  const duringHover = await inactiveButton.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      background: style.background,
      color: style.color,
      borderColor: style.borderColor
    };
  });
  
  console.log('During hover:', duringHover);
  
  // Check if CSS rule is actually applied
  const cssRules = await page.evaluate(() => {
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || sheet.rules || []) {
          if (rule.selectorText && rule.selectorText.includes('.pill:hover')) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText,
              style: rule.style.cssText
            });
          }
        }
      } catch (e) {
        // Skip inaccessible stylesheets
      }
    }
    return rules;
  });
  
  console.log('CSS Rules for .pill:hover:', cssRules);
});
