import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	const beforeHover = await button.evaluate((el) => {
		return getComputedStyle(el).background;
	});

	// Hover and wait for transition to complete
	await button.hover();

	// Wait for the transition duration (200ms) plus some buffer
	await page.waitForTimeout(300);

	const afterHover = await button.evaluate((el) => {
		return getComputedStyle(el).background;
	});

	console.log("Transition-aware hover test:", {
		beforeHover,
		afterHover,
		changed: beforeHover !== afterHover,
	});

	await browser.close();
})();
