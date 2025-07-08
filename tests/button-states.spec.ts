import { test, expect } from '@playwright/test';

test.describe('Button Active States Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Filter buttons show correct active states', async ({ page }) => {
    // Open dropdown first
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();

    // Check that filter buttons exist and have correct data-active attributes
    const filterButtons = page.locator('.filter-btn');
    expect(await filterButtons.count()).toBeGreaterThan(0);

    // Test each filter button
    const filterBtnTexts = await filterButtons.allTextContents();
    console.log('Filter buttons found:', filterBtnTexts);

    for (let i = 0; i < await filterButtons.count(); i++) {
      const button = filterButtons.nth(i);
      const dataActive = await button.getAttribute('data-active');
      const computedStyle = await button.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          background: style.background,
          color: style.color,
          borderColor: style.borderColor,
          opacity: style.opacity,
          boxShadow: style.boxShadow
        };
      });

      console.log(`Filter button ${i}:`, {
        text: await button.textContent(),
        dataActive,
        styles: computedStyle
      });

      // Verify active button has accent styling
      if (dataActive === 'true') {
        // Active button should have a solid background color (not transparent)
        expect(computedStyle.background).not.toContain('rgba(255, 255, 255, 0.1)');
        expect(computedStyle.background).not.toContain('transparent');
        expect(parseFloat(computedStyle.opacity)).toBe(1);
      } else {
        // Inactive button should have transparent/subtle background
        expect(parseFloat(computedStyle.opacity)).toBeLessThan(1);
      }
    }
  });

  test('Sort buttons show correct active states', async ({ page }) => {
    // Open dropdown first
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();

    // Check sort buttons
    const sortButtons = page.locator('.sort-btn');
    expect(await sortButtons.count()).toBeGreaterThan(0);

    const sortBtnTexts = await sortButtons.allTextContents();
    console.log('Sort buttons found:', sortBtnTexts);

    for (let i = 0; i < await sortButtons.count(); i++) {
      const button = sortButtons.nth(i);
      const dataActive = await button.getAttribute('data-active');
      const computedStyle = await button.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          background: style.background,
          color: style.color,
          borderColor: style.borderColor,
          opacity: style.opacity,
          fontWeight: style.fontWeight
        };
      });

      console.log(`Sort button ${i}:`, {
        text: await button.textContent(),
        dataActive,
        styles: computedStyle
      });

      // Verify active styling
      if (dataActive === 'true') {
        expect(computedStyle.background).not.toContain('rgba(255, 255, 255, 0.1)');
        expect(computedStyle.background).not.toContain('transparent');
        expect(parseFloat(computedStyle.opacity)).toBe(1);
        expect(parseInt(computedStyle.fontWeight)).toBeGreaterThanOrEqual(600);
      }
    }
  });

  test('Order buttons show correct active states', async ({ page }) => {
    // Open dropdown first
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();

    // Check order buttons (only visible when sort is not "alpha")
    const orderButtons = page.locator('.order-btn');
    
    if (await orderButtons.count() > 0) {
      console.log('Order buttons found:', await orderButtons.count());

      for (let i = 0; i < await orderButtons.count(); i++) {
        const button = orderButtons.nth(i);
        const dataActive = await button.getAttribute('data-active');
        const computedStyle = await button.evaluate(el => {
          const style = getComputedStyle(el);
          return {
            background: style.background,
            color: style.color,
            borderColor: style.borderColor,
            opacity: style.opacity
          };
        });

        console.log(`Order button ${i}:`, {
          text: await button.textContent(),
          dataActive,
          styles: computedStyle
        });

        // Verify glyph button styling
        if (dataActive === 'true') {
          expect(computedStyle.background).not.toContain('rgba(255, 255, 255, 0.1)');
          expect(computedStyle.background).not.toContain('transparent');
          expect(parseFloat(computedStyle.opacity)).toBe(1);
        }
      }
    } else {
      console.log('No order buttons visible (likely alpha sort is selected)');
    }
  });

  test('Button hover states work correctly', async ({ page }) => {
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();

    // Test hover on an inactive filter button
    const inactiveButton = page.locator('.filter-btn[data-active="false"]').first();
    
    if (await inactiveButton.count() > 0) {
      // Get initial styles
      const initialStyles = await inactiveButton.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          background: style.background,
          transform: style.transform
        };
      });

      // Hover over the button
      await inactiveButton.hover();

      // Wait for CSS transition to complete (button has transition: all 0.2s ease)
      await page.waitForTimeout(300);

      // Get hover styles
      const hoverStyles = await inactiveButton.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          background: style.background,
          transform: style.transform
        };
      });

      console.log('Hover test:', { initialStyles, hoverStyles });

      // Verify hover effect changes background
      expect(hoverStyles.background).not.toBe(initialStyles.background);
      
      // Check for transform (translateY should be applied - might be matrix format)
      expect(hoverStyles.transform).toMatch(/translateY|matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*-1\)/);
    }
  });

  test('Theme toggle affects button colors', async ({ page }) => {
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();

    // Get initial button colors in light theme
    const activeButton = page.locator('.filter-btn[data-active="true"]').first();
    const initialStyles = await activeButton.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        background: style.background,
        color: style.color
      };
    });

    // Toggle to dark theme
    const themeToggle = page.locator('.pill').filter({ hasText: /Dark|Light/ });
    await themeToggle.click();

    // Wait for theme transition
    await page.waitForTimeout(500);

    // Get styles after theme change
    const darkThemeStyles = await activeButton.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        background: style.background,
        color: style.color
      };
    });

    console.log('Theme change test:', { initialStyles, darkThemeStyles });

    // The accent color should remain vibrant (not transparent)
    // but the text color might change based on intelligent contrast
    expect(darkThemeStyles.background).not.toContain('rgba(255, 255, 255, 0.1)');
    expect(darkThemeStyles.background).not.toContain('transparent');
  });

  test('Design tokens are properly loaded', async ({ page }) => {
    // Check that design tokens are available
    const tokenValues = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      return {
        colorAccent: computedStyle.getPropertyValue('--color-accent').trim(),
        colorTextOnAccent: computedStyle.getPropertyValue('--color-text-on-accent').trim(),
        buttonBgInactive: computedStyle.getPropertyValue('--button-bg-inactive').trim(),
        buttonBgHover: computedStyle.getPropertyValue('--button-bg-hover').trim(),
        shadowGlowAccent: computedStyle.getPropertyValue('--shadow-glow-accent').trim()
      };
    });

    console.log('Design tokens:', tokenValues);

    // Verify key tokens exist and have values
    expect(tokenValues.colorAccent).toBeTruthy();
    expect(tokenValues.colorAccent).toMatch(/^(rgb\(|#|color\(display-p3)/); // Accept any valid color format
    expect(tokenValues.colorTextOnAccent).toBeTruthy();
    expect(tokenValues.buttonBgInactive).toBeTruthy();
    expect(tokenValues.shadowGlowAccent).toBeTruthy();
  });

  test('Button interaction updates active states correctly', async ({ page }) => {
    // Open dropdown
    const dropdownTrigger = page.locator('#dropdown-trigger');
    await dropdownTrigger.click();

    // Find an inactive filter button
    const inactiveButton = page.locator('.filter-btn[data-active="false"]').first();
    const buttonText = await inactiveButton.textContent();
    
    console.log(`Testing click on inactive button: ${buttonText}`);

    // Click the inactive button (this should navigate to new URL)
    await inactiveButton.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Verify we're on a new URL with the filter parameter
    const currentUrl = page.url();
    console.log('Current URL after button click:', currentUrl);
    
    expect(currentUrl).toContain('type=');
  });
});
