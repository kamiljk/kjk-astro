import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	// Check all CSS rules that might affect background
	const cssRules = await button.evaluate((el) => {
		const allRules = [];

		// Get all stylesheets
		for (let sheet of document.styleSheets) {
			try {
				for (let rule of sheet.cssRules || sheet.rules) {
					if (rule.type === CSSRule.STYLE_RULE) {
						// Check if this rule applies to our element
						if (el.matches(rule.selectorText)) {
							const backgroundStyle = rule.style.background;
							const backgroundColorStyle = rule.style.backgroundColor;

							if (backgroundStyle || backgroundColorStyle) {
								allRules.push({
									selector: rule.selectorText,
									background: backgroundStyle,
									backgroundColor: backgroundColorStyle,
									cssText: rule.cssText,
								});
							}
						}
					}
				}
			} catch (e) {
				// Skip inaccessible stylesheets
			}
		}

		return allRules;
	});

	console.log("All CSS rules affecting background:", cssRules);

	await browser.close();
})();
