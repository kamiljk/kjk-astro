// playwright test: architecture compliance for feed layout and behavior
import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'tablet', width: 800, height: 1000 },
  { name: 'desktop', width: 1280, height: 1000 },
];

test.describe('Feed Architecture Compliance', () => {
  for (const bp of breakpoints) {
    test(`Feed is single column and fluid at ${bp.name} breakpoint`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await page.waitForSelector('#posts-feed li');
      // Check that all post cards are stacked vertically (single column)
      const cards = await page.$$('#posts-feed > li');
      expect(cards.length).toBeGreaterThan(0);
      // Get bounding boxes for all cards
      const boxes = await Promise.all(cards.map(card => card.boundingBox()));
      // All cards should have the same left x and not overlap vertically
      for (let i = 1; i < boxes.length; i++) {
        expect(Math.abs(boxes[i].x - boxes[0].x)).toBeLessThan(2); // allow 1px rounding
        expect(boxes[i].y).toBeGreaterThan(boxes[i-1].y + boxes[i-1].height - 2); // stacked
      }
    });
  }

  test('Feed infinite scroll loads more posts', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#posts-feed li');
    const initialCount = await page.locator('#posts-feed li').count();
    expect(initialCount).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    const newCount = await page.locator('#posts-feed li').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('Feed respects filtering and sorting', async ({ page }) => {
    const filters = ['all', 'read', 'play', 'about'];
    const sorts = ['newest', 'oldest', 'alpha'];
    for (const filter of filters) {
      for (const sort of sorts) {
        await page.goto(`/?type=${filter}&sort=${sort}`);
        await page.waitForSelector('#posts-feed li');
        const postCount = await page.locator('#posts-feed li').count();
        expect(postCount).toBeGreaterThan(0);
      }
    }
  });

  test('Feed is accessible (ul/li structure, alt text, links)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#posts-feed li');
    // Check ul/li structure
    const ul = await page.$('#posts-feed');
    expect(await ul.evaluate(el => el.tagName)).toBe('UL');
    const lis = await page.$$('#posts-feed > li');
    expect(lis.length).toBeGreaterThan(0);
    // Check each li has a link and (if present) an image with alt
    for (const li of lis) {
      const link = await li.$('a');
      expect(link).not.toBeNull();
      if (await li.$('img')) {
        const img = await li.$('img');
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBe('');
      }
    }
  });

  test('Navbar background and feed alignment', async ({ page }) => {
    await page.goto('/');
    const navbarBg = await page.$('.site-header');
    const navbarContent = await page.$('.navbar-header-row');
    const feed = await page.$('#posts-feed');
    expect(navbarBg).not.toBeNull();
    expect(navbarContent).not.toBeNull();
    expect(feed).not.toBeNull();
    const navbarBgBox = await navbarBg!.boundingBox();
    const navbarContentBox = await navbarContent!.boundingBox();
    const feedBox = await feed!.boundingBox();
    expect(navbarBgBox).not.toBeNull();
    expect(navbarContentBox).not.toBeNull();
    expect(feedBox).not.toBeNull();
    // Feed and navbar content should be same width and aligned
    expect(Math.abs(navbarContentBox!.width - feedBox!.width)).toBeLessThan(2);
    expect(Math.abs(navbarContentBox!.x - feedBox!.x)).toBeLessThan(2);
    // Navbar background should be 2rem wider than feed (1rem each side)
    expect(Math.abs(navbarBgBox!.width - (feedBox!.width + 32))).toBeLessThan(2); // 2rem = 32px
    expect(Math.abs(navbarBgBox!.x - (feedBox!.x - 16))).toBeLessThan(2); // 1rem = 16px
  });
});
