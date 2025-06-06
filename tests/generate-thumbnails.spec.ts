import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of games/posts with their slugs and selectors for screenshot
const games = [
  { slug: 'bitface', selector: '#face-container' },
  { slug: 'badghost', selector: 'canvas' },
  { slug: 'chaos-pendulum-graph', selector: 'canvas' },
  { slug: 'chaoscape', selector: 'canvas' },
  { slug: 'electro-ball', selector: 'canvas' },
  { slug: 'e-crucifix', selector: 'canvas' },
  { slug: 'flow-face', selector: '#face-container, canvas' },
  { slug: 'flow-face-2', selector: '#face-container, canvas' },
  { slug: 'thinking-triangles', selector: 'canvas, svg' },
];

const screenshotsDir = path.resolve(__dirname, '../screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

games.forEach(({ slug, selector }) => {
  test(`Generate thumbnail screenshot for ${slug}`, async ({ page }, testInfo) => {
    await page.goto(`/games/${slug}/index.html`);
    await page.waitForSelector(selector, { timeout: 5000 });
    
    // Get viewport dimensions
    const viewportSize = page.viewportSize();
    if (!viewportSize) {
      throw new Error('Unable to get viewport size');
    }
    
    // Calculate the true center of the page for capturing
    // Get the element's position to ensure we're capturing the relevant content
    const element = await page.$(selector);
    const boundingBox = await element?.boundingBox();
    
    // If we have a bounding box, center the screenshot on the element
    // Otherwise, center on the viewport
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
    
    const screenshotPath = path.join(screenshotsDir, `${slug}-thumbnail.png`);
    console.log(`Taking screenshot for ${slug} at x:${centerX}, y:${centerY}`);
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      clip: { 
        x: centerX, 
        y: centerY, 
        width: 500, 
        height: 500 
      },
    });
    // Move screenshot to game folder
    const dest = path.resolve(__dirname, `../public/games/${slug}/thumbnail.png`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(screenshotPath, dest);
  });
});
