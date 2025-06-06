import { test, expect } from '@playwright/test';

test('Feed and post pages have consistent horizontal alignment', async ({ page }) => {
  // Load the feed
  await page.goto('/');
  // Wait for the first real post card to render by targeting li with feed-pay-link
  await page.waitForSelector('#posts-feed > li:has(a[data-testid="feed-post-link"])');
  const feedCard = page.locator('#posts-feed > li:has(a[data-testid="feed-post-link"])').first();
  await expect(feedCard).toBeVisible();
  // Scroll feed card into view to ensure boundingBox is available
  await feedCard.scrollIntoViewIfNeeded();
  const feedBox = await feedCard.boundingBox();
  expect(feedBox).not.toBeNull();
  const feedX = feedBox!.x;

  // Get the link to the first post and navigate
  const postLink = feedCard.locator('a[href]').first();
  const href = await postLink.getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href!);

  // Check the post-card on the post page
  // Wait for post page wrapper to render
  // Wait for post page item to render (should be the first list item)
  await page.waitForSelector('#posts-feed > li');
  const postCard = page.locator('#posts-feed > li').first();
  await expect(postCard).toBeVisible();
  // Scroll post card into view to ensure boundingBox is available
  await postCard.scrollIntoViewIfNeeded();
  const postBox = await postCard.boundingBox();
  expect(postBox).not.toBeNull();
  const postX = postBox!.x;

  // Assert horizontal x-coordinate matches feed
  expect(postX).toBeCloseTo(feedX, 1);
});
