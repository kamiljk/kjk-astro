// playwright test: Card mobile layout compliance
import { test, expect } from '@playwright/test';

test.describe('Card Mobile Layout', () => {
  test('Cards with thumbnails maintain horizontal layout at all viewport sizes', async ({ page }) => {
    const breakpoints = [
      { name: 'extra-narrow', width: 320, height: 568 }, // iPhone SE
      { name: 'narrow', width: 375, height: 667 }, // iPhone 8
      { name: 'mobile', width: 390, height: 844 }, // iPhone 12
      { name: 'tablet', width: 768, height: 1024 }, // iPad
      { name: 'desktop', width: 1280, height: 800 },
    ];

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      
      // Wait for feed to load
      await page.waitForSelector('#posts-feed');
      
      // Find cards with thumbnails
      const cardsWithThumbnails = await page.$$('.post-card-inner.with-thumbnail');
      
      if (cardsWithThumbnails.length > 0) {
        for (let i = 0; i < Math.min(cardsWithThumbnails.length, 3); i++) {
          const card = cardsWithThumbnails[i];
          
          // Get card container bounding box
          const cardBox = await card.boundingBox();
          
          // Get content area
          const content = await card.$('.post-card-content');
          const contentBox = await content?.boundingBox();
          
          // Get thumbnail
          const thumbnail = await card.$('.post-card-thumbnail');
          const thumbnailBox = await thumbnail?.boundingBox();
          
          if (contentBox && thumbnailBox && cardBox) {
            // Verify thumbnail is to the right of content
            expect(thumbnailBox.x).toBeGreaterThan(contentBox.x);
            
            // Verify they are horizontally aligned (same row)
            const contentCenterY = contentBox.y + contentBox.height / 2;
            const thumbnailCenterY = thumbnailBox.y + thumbnailBox.height / 2;
            const verticalOverlap = Math.abs(contentCenterY - thumbnailCenterY);
            
            // Allow some tolerance for vertical centering differences
            expect(verticalOverlap).toBeLessThan(cardBox.height * 0.3);
            
            // Verify thumbnail is square (aspect ratio 1:1)
            const aspectRatio = thumbnailBox.width / thumbnailBox.height;
            expect(aspectRatio).toBeCloseTo(1, 1); // Within 0.1 tolerance
            
            // Verify content and thumbnail don't stack vertically (thumbnail below content)
            expect(thumbnailBox.y).toBeLessThan(contentBox.y + contentBox.height);
          }
        }
      }
    }
  });

  test('Card content adapts appropriately to narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Narrowest common mobile
    await page.goto('/');
    
    await page.waitForSelector('#posts-feed');
    
    const cardsWithThumbnails = await page.$$('.post-card-inner.with-thumbnail');
    
    if (cardsWithThumbnails.length > 0) {
      const card = cardsWithThumbnails[0];
      
      // Verify card fits within viewport
      const cardBox = await card.boundingBox();
      if (cardBox) {
        expect(cardBox.width).toBeLessThanOrEqual(320);
      }
      
      // Verify content is readable (not too cramped)
      const title = await card.$('.title, h2');
      if (title) {
        const titleText = await title.textContent();
        expect(titleText?.length).toBeGreaterThan(0);
      }
      
      // Verify thumbnail is still visible and square
      const thumbnail = await card.$('.post-thumb-large');
      if (thumbnail) {
        const thumbnailBox = await thumbnail.boundingBox();
        if (thumbnailBox) {
          expect(thumbnailBox.width).toBeGreaterThan(50); // Minimum usable size
          expect(thumbnailBox.height).toBeGreaterThan(50);
          
          const aspectRatio = thumbnailBox.width / thumbnailBox.height;
          expect(aspectRatio).toBeCloseTo(1, 1);
        }
      }
    }
  });
});
