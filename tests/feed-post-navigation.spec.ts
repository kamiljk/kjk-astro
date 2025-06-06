import { test, expect } from '@playwright/test';

// This test checks that clicking a feed post opens the correct page and allows interaction

test.describe('Feed post navigation and interaction', () => {
  test('Clicking a feed post opens the correct page and allows interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="feed-post-link"]');
    // Click the first post link
    const firstPost = await page.locator('[data-testid="feed-post-link"]').first();
    const href = await firstPost.getAttribute('href');
    expect(href).toBeTruthy();
    if (!href) throw new Error('No href found on first feed post link');
    await firstPost.click();
    // Wait for navigation
    await page.waitForURL(href, { timeout: 3000 });
    // Check that the new page is loaded and interactive
    // For games: look for a game root test id
    const isGame = href.includes('/games/');
    if (isGame) {
      // Wait for the Bitface game root
      const hasGame = await page.locator('[data-testid="bitface-game-root"]').first().isVisible().catch(() => false);
      expect(hasGame).toBeTruthy();
    } else {
      // Wait for article content
      const hasArticle = await page.locator('article, .article-content, .prose').first().isVisible().catch(() => false);
      expect(hasArticle).toBeTruthy();
    }
  });
});

test.describe('Feed CTA navigation and interaction', () => {
  test('Clicking the READ CTA opens the correct post page with content', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="feed-cta-link"]');
    // Click the first CTA button
    const firstCta = await page.locator('[data-testid="feed-cta-link"]').first();
    const href = await firstCta.getAttribute('href');
    expect(href).toBeTruthy();
    if (!href) throw new Error('No href found on first feed CTA link');
    await firstCta.click();
    // Wait for navigation
    await page.waitForURL(href, { timeout: 3000 });
    // Check that the new page is loaded and contains article content
    const hasArticle = await page.locator('article, .article-content, .prose').first().isVisible().catch(() => false);
    expect(hasArticle).toBeTruthy();
    // Navbar should still be visible
    const navbarVisible = await page.locator('.navbar, nav, .navbar-header-row').first().isVisible().catch(() => false);
    expect(navbarVisible).toBeTruthy();
  });
});
