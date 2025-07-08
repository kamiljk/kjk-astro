import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	// Get the token values
	const tokens = await page.evaluate(() => {
		const style = getComputedStyle(document.documentElement);
		return {
			buttonBgHover: style.getPropertyValue("--button-bg-hover").trim(),
			buttonBgInactive: style.getPropertyValue("--button-bg-inactive").trim(),
			colorAccent: style.getPropertyValue("--color-accent").trim(),
		};
	});

	console.log("Tokens from manual page:", tokens);

	await browser.close();
})();
