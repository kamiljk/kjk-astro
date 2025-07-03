import { test, expect } from '@playwright/test';

test.describe('Dropdown Responsive Grid Layout', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		
		// Open the dropdown menu
		const menuToggle = page.locator('[data-testid="navbar-menu-toggle"], .menu-toggle-btn').first();
		await menuToggle.click();
		
		// Wait for dropdown to be visible
		await page.waitForSelector('.menu-container.visible', { state: 'visible' });
	});

	test('should have consistent button sizes across all viewports', async ({ page }) => {
		const viewports = [
			{ width: 1200, height: 800, name: 'desktop' },
			{ width: 768, height: 1024, name: 'tablet' },
			{ width: 480, height: 800, name: 'mobile' }
		];

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await page.waitForTimeout(300); // Allow for responsive transition

			// Check pill buttons have consistent sizing
			const pills = page.locator('.pill');
			const pillCount = await pills.count();
			
			if (pillCount > 0) {
				const firstPill = pills.first();
				const firstPillBox = await firstPill.boundingBox();
				
				// Verify minimum height
				expect(firstPillBox?.height, `Pill height on ${viewport.name}`).toBeGreaterThanOrEqual(28);
				
				// Check all pills have similar heights (within 4px tolerance)
				for (let i = 1; i < pillCount; i++) {
					const pill = pills.nth(i);
					const pillBox = await pill.boundingBox();
					expect(Math.abs((pillBox?.height || 0) - (firstPillBox?.height || 0)), 
						`Pill ${i} height consistency on ${viewport.name}`).toBeLessThanOrEqual(4);
				}
			}

			// Check sort arrows have consistent sizing
			const sortArrows = page.locator('.sort-arrow');
			const arrowCount = await sortArrows.count();
			
			if (arrowCount > 0) {
				const firstArrow = sortArrows.first();
				const firstArrowBox = await firstArrow.boundingBox();
				
				// Verify minimum dimensions
				expect(firstArrowBox?.height, `Sort arrow height on ${viewport.name}`).toBeGreaterThanOrEqual(20);
				expect(firstArrowBox?.width, `Sort arrow width on ${viewport.name}`).toBeGreaterThanOrEqual(20);
			}
		}
	});

	test('should smoothly transition from single row to multiple rows', async ({ page }) => {
		// Start with desktop view (single row)
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.waitForTimeout(300);

		const menuContent = page.locator('.menu-content');
		let contentBox = await menuContent.boundingBox();
		const desktopHeight = contentBox?.height || 0;

		// Check grid layout is single row on desktop
		const gridColumns = await menuContent.evaluate(el => 
			window.getComputedStyle(el).gridTemplateColumns
		);
		expect(gridColumns).toContain('1fr auto auto'); // Three columns layout

		// Transition to tablet (2-row layout)
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.waitForTimeout(300);

		contentBox = await menuContent.boundingBox();
		const tabletHeight = contentBox?.height || 0;

		// Should be taller due to wrapping
		expect(tabletHeight).toBeGreaterThan(desktopHeight * 0.8);

		// Transition to mobile (3-row layout)
		await page.setViewportSize({ width: 480, height: 800 });
		await page.waitForTimeout(300);

		contentBox = await menuContent.boundingBox();
		const mobileHeight = contentBox?.height || 0;

		// Should be tallest due to vertical stacking
		expect(mobileHeight).toBeGreaterThan(tabletHeight * 0.8);

		// Check mobile grid is single column
		const mobileGridColumns = await menuContent.evaluate(el => 
			window.getComputedStyle(el).gridTemplateColumns
		);
		expect(mobileGridColumns).toContain('1fr'); // Single column layout
	});

	test('should not have overlapping content at any viewport', async ({ page }) => {
		const viewports = [
			{ width: 1200, height: 800 },
			{ width: 900, height: 600 },
			{ width: 768, height: 1024 },
			{ width: 600, height: 800 },
			{ width: 480, height: 800 },
			{ width: 360, height: 640 }
		];

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await page.waitForTimeout(300);

			// Get all interactive elements in the dropdown
			const elements = await page.locator('.menu-content .pill, .menu-content .sort-arrow, .menu-content .section-label').all();
			
			if (elements.length < 2) continue;

			// Check no elements overlap
			for (let i = 0; i < elements.length - 1; i++) {
				const element1Box = await elements[i].boundingBox();
				if (!element1Box) continue;

				for (let j = i + 1; j < elements.length; j++) {
					const element2Box = await elements[j].boundingBox();
					if (!element2Box) continue;

					// Check for overlap (with 2px tolerance for borders)
					const noOverlap = (
						element1Box.x + element1Box.width <= element2Box.x + 2 ||
						element2Box.x + element2Box.width <= element1Box.x + 2 ||
						element1Box.y + element1Box.height <= element2Box.y + 2 ||
						element2Box.y + element2Box.height <= element1Box.y + 2
					);

					expect(noOverlap, 
						`Elements should not overlap at ${viewport.width}x${viewport.height}. ` +
						`Element ${i}: (${element1Box.x}, ${element1Box.y}, ${element1Box.width}x${element1Box.height}) ` +
						`Element ${j}: (${element2Box.x}, ${element2Box.y}, ${element2Box.width}x${element2Box.height})`
					).toBeTruthy();
				}
			}
		}
	});

	test('should maintain proper spacing between sections', async ({ page }) => {
		const viewports = [
			{ width: 1200, height: 800, name: 'desktop' },
			{ width: 768, height: 1024, name: 'tablet' },
			{ width: 480, height: 800, name: 'mobile' }
		];

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await page.waitForTimeout(300);

			// Check spacing between sections
			const sections = page.locator('.menu-section');
			const sectionCount = await sections.count();

			for (let i = 0; i < sectionCount - 1; i++) {
				const section1 = sections.nth(i);
				const section2 = sections.nth(i + 1);
				
				const section1Box = await section1.boundingBox();
				const section2Box = await section2.boundingBox();
				
				if (section1Box && section2Box) {
					// Calculate gap between sections
					const gap = Math.min(
						Math.abs(section2Box.x - (section1Box.x + section1Box.width)),
						Math.abs(section2Box.y - (section1Box.y + section1Box.height))
					);
					
					// Should have at least 8px gap between sections
					expect(gap, `Gap between sections ${i} and ${i+1} on ${viewport.name}`).toBeGreaterThanOrEqual(8);
				}
			}
		}
	});
});
