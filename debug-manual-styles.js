import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	// Try to manually trigger the styles to see if it's a selector issue
	const beforeStyles = await button.evaluate((el) => {
		const computed = getComputedStyle(el);
		return {
			background: computed.background,
			buttonBgHover: computed.getPropertyValue("--button-bg-hover"),
		};
	});

	// Manually apply the hover styles via JavaScript
	await button.evaluate((el) => {
		el.style.background = "var(--button-bg-hover)";
	});

	const manualStyles = await button.evaluate((el) => {
		const computed = getComputedStyle(el);
		return {
			background: computed.background,
		};
	});

	// Reset and try CSS hover
	await button.evaluate((el) => {
		el.style.background = "";
	});

	await button.hover();

	const hoverStyles = await button.evaluate((el) => {
		const computed = getComputedStyle(el);
		return {
			background: computed.background,
		};
	});

	console.log("Manual page styles test:", {
		beforeStyles,
		manualStyles,
		hoverStyles,
	});

	await browser.close();
})();
