import { test, expect } from '@playwright/test';

test.describe('Alignment Tests', () => {
  test('Verify .site-header is centered in the viewport', async ({ page }) => {
    await page.goto('/'); // Adjust the URL to your homepage

    const siteHeader = await page.locator('.site-header');
    const boundingBox = await siteHeader.boundingBox();

    expect(boundingBox).not.toBeNull();

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const headerCenter = boundingBox.x + boundingBox.width / 2;

    expect(headerCenter).toBeCloseTo(viewportWidth / 2, 1);
  });

  test('Verify #posts-feed is centered in the viewport', async ({ page }) => {
    await page.goto('/'); // Adjust the URL to your homepage

    const postsFeed = await page.locator('#posts-feed');
    const boundingBox = await postsFeed.boundingBox();

    expect(boundingBox).not.toBeNull();

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const feedCenter = boundingBox.x + boundingBox.width / 2;

    expect(feedCenter).toBeCloseTo(viewportWidth / 2, 1);
  });
});
