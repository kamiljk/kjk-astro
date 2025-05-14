// playwright test: infinite scroll for posts feed
import { test, expect } from '@playwright/test';

test.describe('Feed Infinite Scroll', () => {
  test('loads more posts when scrolling to bottom', async ({ page }) => {
    await page.goto('/');
    // Wait for initial posts to load
    await page.waitForSelector('#posts-feed li');
    const initialCount = await page.locator('#posts-feed li').count();
    expect(initialCount).toBeGreaterThan(0);

    // Scroll to bottom to trigger infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Wait for loader to appear and more posts to load
    await page.waitForTimeout(1200); // allow time for fetch/render
    const newCount = await page.locator('#posts-feed li').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });
});
