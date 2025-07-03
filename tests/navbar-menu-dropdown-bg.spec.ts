import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1200, height: 900 }, // desktop
  { width: 900, height: 900 }, // tablet
  { width: 600, height: 900 }, // mobile
];

const expectedBg = {
  light: 'rgba(255, 255, 255, 0.69)',
  dark: 'rgba(26, 26, 26, 0.92)'
};

test.describe('NavbarMenu Dropdown Background', () => {
  for (const viewport of viewports) {
    for (const theme of ['light', 'dark']) {
      test(`dropdown background matches navbar in ${theme} mode at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        // Set theme
        await page.evaluate(theme => {
          document.body.dataset.theme = theme;
        }, theme);
        const menuBtn = page.locator('.nav__menu-btn');
        await menuBtn.click();
        // Add debugging logs to inspect dropdown visibility properties
        const dropdown = page.locator('#filter-sort-menu');
        console.log('Dropdown state:', await dropdown.getAttribute('aria-hidden'));
        console.log('Dropdown class:', await dropdown.getAttribute('class'));
        const computedStyles = await dropdown.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                opacity: styles.opacity,
                visibility: styles.visibility,
                display: styles.display,
                pointerEvents: styles.pointerEvents
            };
        });
        console.log('Computed styles:', computedStyles);
        await expect(dropdown).toBeVisible();
        // Get computed background color
        const bg = await dropdown.evaluate(el => {
            const styles = getComputedStyle(el);
            console.log('Computed background color:', styles.backgroundColor);
            return styles.backgroundColor;
        });
        expect(bg).toBe(expectedBg[theme]);

        // Fix debug logs to access menuOpen from the component
        const menuOpenState = await page.evaluate(() => {
            const menuComponent = document.querySelector('.nav__menu-btn');
            return menuComponent ? menuComponent.getAttribute('aria-expanded') : null;
        });
        console.log(`[Debug] menuOpen state during test: ${menuOpenState}`);
      });
    }
  }
});
