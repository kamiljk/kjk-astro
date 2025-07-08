import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	// Test inline styles with different approaches
	const tests = await button.evaluate((el) => {
		const results = {};

		// Test 1: Inline style with specific color
		el.style.setProperty("background", "#ff0000", "important");
		results.inlineImportant = getComputedStyle(el).background;

		// Test 2: Inline background-color instead
		el.style.removeProperty("background");
		el.style.setProperty("background-color", "#ff0000", "important");
		results.backgroundColorImportant = getComputedStyle(el).backgroundColor;

		// Test 3: Check if there are any other rules affecting it
		el.style.removeProperty("background-color");

		// Check what property values are actually being applied
		const computed = getComputedStyle(el);
		results.finalComputed = {
			background: computed.background,
			backgroundColor: computed.backgroundColor,
			backgroundImage: computed.backgroundImage,
		};

		return results;
	});

	console.log("Inline style tests:", tests);

	await browser.close();
})();
