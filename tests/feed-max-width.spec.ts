// playwright test: Feed max-width compliance
import { test, expect } from '@playwright/test';

test.describe('Feed Max Width', () => {
  test('Feed container does not exceed 840px width at any breakpoint', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 800 },
      { name: 'tablet', width: 800, height: 1000 },
      { name: 'desktop', width: 1280, height: 1000 },
      { name: 'ultrawide', width: 1920, height: 1080 },
    ];
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      const feed = await page.$('#posts-feed');
      const box = await feed.boundingBox();
      expect(box.width).toBeLessThanOrEqual(840);
    }
  });
});
