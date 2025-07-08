import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	// Test different ways of applying the color
	const tests = await button.evaluate((el) => {
		const computed = getComputedStyle(el);

		// Get the actual token value
		const tokenValue = computed.getPropertyValue("--button-bg-hover").trim();

		// Test 1: Apply the resolved color directly
		el.style.background = tokenValue;
		const directColorBackground = getComputedStyle(el).background;

		// Test 2: Apply via CSS variable
		el.style.background = "var(--button-bg-hover)";
		const cssVarBackground = getComputedStyle(el).background;

		// Test 3: Apply to background-color instead of background
		el.style.background = "";
		el.style.backgroundColor = "var(--button-bg-hover)";
		const bgColorBackground = getComputedStyle(el).backgroundColor;

		return {
			tokenValue,
			directColorBackground,
			cssVarBackground,
			bgColorBackground,
		};
	});

	console.log("CSS Variable resolution test:", tests);

	await browser.close();
})();
