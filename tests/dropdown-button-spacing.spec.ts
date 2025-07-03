import { test, expect } from '@playwright/test';

const viewports = [
  { width: 1200, height: 900, name: 'desktop' },
  { width: 900, height: 900, name: 'tablet' },
  { width: 600, height: 900, name: 'mobile' },
  { width: 480, height: 900, name: 'mobile-narrow' },
  { width: 360, height: 900, name: 'mobile-small' },
];

test.describe('Dropdown Button Spacing', () => {
  for (const viewport of viewports) {
    test(`buttons have proper breathing room from container edges at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Open the dropdown menu
      const menuBtn = page.locator('.nav__menu-btn');
      await menuBtn.click();
      
      const dropdown = page.locator('#filter-sort-menu');
      await expect(dropdown).toBeVisible();
      
      // Get the dropdown container and content
      const menuContainer = page.locator('.menu-container');
      const menuContent = page.locator('.menu-content');
      
      // Get first filter button and last sort button for edge testing
      const firstFilterButton = page.locator('.filter-section .pill').first();
      const lastSortButton = page.locator('.sort-section .pill').last();
      
      // Get the pills containers that directly contain the buttons
      const filterPillsContainer = page.locator('.filter-section .pills-container');
      const sortPillsContainer = page.locator('.sort-section .pills-container');
      
      await expect(firstFilterButton).toBeVisible();
      await expect(lastSortButton).toBeVisible();
      await expect(filterPillsContainer).toBeVisible();
      
      // Get bounding boxes
      const containerBox = await menuContainer.boundingBox();
      const firstButtonBox = await firstFilterButton.boundingBox();
      const lastButtonBox = await lastSortButton.boundingBox();
      const filterContainerBox = await filterPillsContainer.boundingBox();
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `test-results/dropdown-spacing-${viewport.width}px.png`,
        fullPage: false
      });
      
      if (containerBox && firstButtonBox && lastButtonBox && filterContainerBox) {
        // Check left edge spacing (first button should have breathing room from left edge)
        const leftSpacing = firstButtonBox.x - containerBox.x;
        console.log(`[${viewport.name}] Left spacing: ${leftSpacing}px`);
        
        // Check right edge spacing (last button should have breathing room from right edge)
        const rightSpacing = (containerBox.x + containerBox.width) - (lastButtonBox.x + lastButtonBox.width);
        console.log(`[${viewport.name}] Right spacing: ${rightSpacing}px`);
        
        // Check top edge spacing (filter container should have breathing room from top)
        const topSpacing = filterContainerBox.y - containerBox.y;
        console.log(`[${viewport.name}] Top spacing: ${topSpacing}px`);
        
        // Assert practical spacing requirements - focus on preventing flush-against-edge scenarios
        // The spacing should be "reasonable" not necessarily meeting exact pixel requirements
        if (viewport.width >= 900) {
          // Desktop/tablet: expect good left spacing and some top spacing
          expect(leftSpacing).toBeGreaterThanOrEqual(20);
          expect(rightSpacing).toBeGreaterThanOrEqual(15); 
          expect(topSpacing).toBeGreaterThan(0); // Just ensure it's not completely flush
          expect(leftSpacing).toBeLessThanOrEqual(70);
          expect(rightSpacing).toBeLessThanOrEqual(400);
          expect(topSpacing).toBeLessThanOrEqual(50);
        } else if (viewport.width >= 481) {
          // Medium screens: expect reasonable left spacing
          expect(leftSpacing).toBeGreaterThanOrEqual(8);
          expect(rightSpacing).toBeGreaterThanOrEqual(5);
          expect(topSpacing).toBeGreaterThan(0);
          expect(leftSpacing).toBeLessThanOrEqual(50);
          expect(rightSpacing).toBeLessThanOrEqual(350);
          expect(topSpacing).toBeLessThanOrEqual(50);
        } else {
          // Mobile: more lenient but still not flush
          expect(leftSpacing).toBeGreaterThanOrEqual(5);
          expect(rightSpacing).toBeGreaterThanOrEqual(5);
          expect(topSpacing).toBeGreaterThan(0);
          expect(leftSpacing).toBeLessThanOrEqual(40);
          expect(rightSpacing).toBeLessThanOrEqual(300);
          expect(topSpacing).toBeLessThanOrEqual(50);
        }
      }
    });
  }
  
  test('buttons maintain consistent spacing ratios across viewports', async ({ page }) => {
    interface SpacingResult {
      viewport: string;
      width: number;
      leftSpacing: number;
      topSpacing: number;
      spacingRatio: number;
    }
    
    const spacingResults: SpacingResult[] = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      const menuBtn = page.locator('.nav__menu-btn');
      await menuBtn.click();
      
      const dropdown = page.locator('#filter-sort-menu');
      await expect(dropdown).toBeVisible();
      
      const menuContainer = page.locator('.menu-container');
      const firstButton = page.locator('.filter-section .pill').first();
      
      const containerBox = await menuContainer.boundingBox();
      const buttonBox = await firstButton.boundingBox();
      
      if (containerBox && buttonBox) {
        const leftSpacing = buttonBox.x - containerBox.x;
        const topSpacing = buttonBox.y - containerBox.y;
        
        spacingResults.push({
          viewport: viewport.name,
          width: viewport.width,
          leftSpacing,
          topSpacing,
          spacingRatio: leftSpacing / viewport.width,
        });
      }
    }
    
    // Log results for analysis
    console.log('Spacing consistency across viewports:');
    spacingResults.forEach(result => {
      console.log(`${result.viewport} (${result.width}px): left=${result.leftSpacing}px, top=${result.topSpacing}px, ratio=${result.spacingRatio.toFixed(4)}`);
    });
    
    // The spacing should be proportional but not necessarily linear
    // Check that spacing decreases appropriately on smaller screens
    const desktop = spacingResults.find(r => r.viewport === 'desktop');
    const mobile = spacingResults.find(r => r.viewport === 'mobile-small');
    
    if (desktop && mobile) {
      // Mobile spacing should be smaller than desktop but not dramatically so
      expect(mobile.leftSpacing).toBeLessThan(desktop.leftSpacing);
      expect(mobile.leftSpacing).toBeGreaterThan(desktop.leftSpacing * 0.4); // at least 40% of desktop spacing
    }
  });
});
