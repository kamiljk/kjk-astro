import { test, expect } from '@playwright/test';

test('Generate thumbnail screenshot for Bitface game', async ({ page }) => {
  // Navigate to the Bitface game page
  await page.goto('/games/bitface/index.html');

  // Wait for the face container to be visible
  await page.waitForSelector('#face-container');

  // Get viewport dimensions
  const viewportSize = page.viewportSize();
  if (!viewportSize) {
    throw new Error('Unable to get viewport size');
  }
  
  // Get the element position
  const faceContainer = await page.$('#face-container');
  const boundingBox = await faceContainer?.boundingBox();
  
  // Calculate the true center of the page for capturing
  let centerX, centerY;
  
  if (boundingBox) {
    // Center on the element
    centerX = boundingBox.x + (boundingBox.width / 2) - 250;
    centerY = boundingBox.y + (boundingBox.height / 2) - 250;
  } else {
    // Center on the viewport
    centerX = Math.max(0, (viewportSize.width - 500) / 2);
    centerY = Math.max(0, (viewportSize.height - 500) / 2);
  }
  
  // Ensure we don't go out of bounds
  centerX = Math.max(0, Math.min(centerX, viewportSize.width - 500));
  centerY = Math.max(0, Math.min(centerY, viewportSize.height - 500));
  
  console.log(`Taking screenshot for BitFace at x:${centerX}, y:${centerY}`);
  
  // Take a screenshot centered on the page
  await page.screenshot({
    path: 'screenshots/bitface-thumbnail.png',
    fullPage: false,
    clip: { 
      x: centerX, 
      y: centerY, 
      width: 500, 
      height: 500 
    },
  });

  // Assert that the face container is visible
  expect(faceContainer).not.toBeNull();
});