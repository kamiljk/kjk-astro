import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	// Force the hover state using CSS selector and check all matching rules
	const hoverRules = await page.evaluate(() => {
		const rules = [];

		// Get all stylesheets
		for (let sheet of document.styleSheets) {
			try {
				for (let rule of sheet.cssRules || sheet.rules) {
					if (rule.type === CSSRule.STYLE_RULE) {
						if (
							rule.selectorText &&
							rule.selectorText.includes(".pill:hover")
						) {
							rules.push({
								selector: rule.selectorText,
								cssText: rule.cssText,
								background: rule.style.background || "not set",
								declarations: Array.from(rule.style).map(
									(prop) => `${prop}: ${rule.style.getPropertyValue(prop)}`
								),
							});
						}
					}
				}
			} catch (e) {
				// Skip inaccessible stylesheets
			}
		}

		return rules;
	});

	console.log("Hover CSS rules found:", hoverRules);

	// Also check if we can manually add a hover rule
	await page.addStyleTag({
		content: `
      .pill.manual-hover {
        background: #ff0000 !important;
      }
    `,
	});

	await button.evaluate((el) => {
		el.classList.add("manual-hover");
	});

	const manualHoverBackground = await button.evaluate((el) => {
		return getComputedStyle(el).background;
	});

	console.log("Manual hover class background:", manualHoverBackground);

	await browser.close();
})();
