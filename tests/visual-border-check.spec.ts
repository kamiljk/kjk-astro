import { test } from '@playwright/test';

const captureScreenshot = async (page, theme, element, fileName) => {
	await page.evaluate(() => {
		document.documentElement.setAttribute('data-theme', theme);
	});
	await page.waitForTimeout(500); // Wait for theme transition

	if (element === 'navbar') {
		await page.screenshot({
			path: `test-results/${fileName}`,
			clip: { x: 0, y: 0, width: 1200, height: 120 },
		});
	} else if (element === 'dropdown') {
		await page.click('[aria-label="Open menu"]');
		await page.waitForSelector('[role="menu"]', { state: 'visible' });
		await page.waitForTimeout(200);
		await page.screenshot({
			path: `test-results/${fileName}`,
			clip: { x: 0, y: 0, width: 1200, height: 300 },
		});
		await page.click('[aria-label="Open menu"]');
	}
};

test.describe('Visual Border Consistency Check', () => {
	test('take screenshots of navbar and dropdown in both themes', async ({ page }) => {
		await page.goto('http://localhost:4321');
		await page.waitForSelector('.site-header');

		const themes = ['light', 'dark'];
		const elements = ['navbar', 'dropdown'];

		for (const theme of themes) {
			for (const element of elements) {
				const fileName = `${element}-${theme}-mode.png`;
				await captureScreenshot(page, theme, element, fileName);
			}
		}

		console.log('Screenshots saved to test-results/ directory');
	});
});
