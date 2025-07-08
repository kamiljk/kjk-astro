import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	const beforeHover = await button.evaluate((el) => {
		const style = getComputedStyle(el);
		return { background: style.background };
	});

	await button.hover();

	const duringHover = await button.evaluate((el) => {
		const style = getComputedStyle(el);
		return { background: style.background };
	});

	console.log("Manual page test:", { beforeHover, duringHover });

	await browser.close();
})();
