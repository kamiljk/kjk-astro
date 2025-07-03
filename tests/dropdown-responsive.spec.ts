import { test, expect } from '@playwright/test';

test.describe('Dropdown Responsive Design', () => {
	test('dropdown layout consistency across breakpoints', async ({ page }) => {
		// Test desktop view (1200px)
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.goto('http://localhost:4321');
		await page.click('[aria-label="Open menu"]');
		await page.waitForSelector('[role="menu"]', { state: 'visible' });
		
		await page.screenshot({ 
			path: 'test-results/dropdown-1200px.png',
			clip: { x: 0, y: 0, width: 1200, height: 300 }
		});
		
		// Test tablet view (768px)
		await page.setViewportSize({ width: 768, height: 800 });
		await page.waitForTimeout(200);
		
		await page.screenshot({ 
			path: 'test-results/dropdown-768px.png',
			clip: { x: 0, y: 0, width: 768, height: 300 }
		});
		
		// Test mobile view (480px)
		await page.setViewportSize({ width: 480, height: 800 });
		await page.waitForTimeout(200);
		
		await page.screenshot({ 
			path: 'test-results/dropdown-480px.png',
			clip: { x: 0, y: 0, width: 480, height: 400 }
		});
		
		// Verify all pills/buttons are visible and functional (labels are now hidden for compactness)
		await expect(page.locator('button:has-text("all")')).toBeVisible();
		await expect(page.locator('button:has-text("Updated")')).toBeVisible();
		// Optionally check for other pills/buttons as needed
		
		// Test theme toggle functionality
		const themeToggle = page.locator('.theme-toggle-btn');
		await expect(themeToggle).toBeVisible();
		await themeToggle.click();
		
		console.log('Responsive screenshots saved: dropdown-1200px.png, dropdown-768px.png, dropdown-480px.png');
	});
});
