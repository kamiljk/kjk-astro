import { test, expect } from '@playwright/test';

test('Generate thumbnail screenshot for Bitface game', async ({ page }) => {
  // Navigate to the Bitface game page
  await page.goto('/games/bitface/index.html');

  // Wait for the face container to be visible
  await page.waitForSelector('#face-container');

  // Take a screenshot of the game page
  await page.screenshot({
    path: 'screenshots/bitface-thumbnail.png',
    fullPage: true,
  });

  // Assert that the face container is visible
  const faceContainer = await page.$('#face-container');
  expect(faceContainer).not.toBeNull();
});