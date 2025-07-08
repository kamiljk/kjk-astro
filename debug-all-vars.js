import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	// Check ALL CSS variables available
	const allVars = await page.evaluate(() => {
		const style = getComputedStyle(document.documentElement);
		const vars = {};

		// Get all CSS custom properties
		for (let i = 0; i < style.length; i++) {
			const prop = style[i];
			if (prop.startsWith("--")) {
				vars[prop] = style.getPropertyValue(prop).trim();
			}
		}

		return vars;
	});

	console.log(
		"All CSS variables:",
		Object.keys(allVars).filter((key) => key.includes("button"))
	);
	console.log(
		"Button-related tokens:",
		Object.fromEntries(
			Object.entries(allVars).filter(([key]) => key.includes("button"))
		)
	);

	await browser.close();
})();
