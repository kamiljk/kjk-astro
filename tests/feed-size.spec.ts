import { test, expect } from '@playwright/test';

// This test checks that the feed container never exceeds 840px at any viewport size

test.describe('Feed max-width compliance', () => {
  const FEED_SELECTORS = [
    '#posts-feed',
    '.single-column-feed',
    '.main-alignment-wrapper',
    '.site-container main',
  ];

  for (const width of [400, 600, 900, 1200, 1600]) {
    test(`Feed containers do not exceed 840px at viewport width ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      for (const selector of FEED_SELECTORS) {
        const el = await page.$(selector);
        if (el) {
          const box = await el.boundingBox();
          expect(box?.width, `Selector ${selector} at width ${width}`).toBeLessThanOrEqual(840);
        }
      }
    });
  }
});
