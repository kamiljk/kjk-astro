const { test, expect } = require("@playwright/test");

test("navbar visibility test", async ({ page }) => {
	// Go to the homepage
	await page.goto("http://localhost:4324/");

	// Wait for page to load
	await page.waitForLoadState("networkidle");

	// Take a screenshot first
	await page.screenshot({ path: "navbar-debug.png", fullPage: true });

	// Check if navbar exists
	const navbar = await page.locator(".navbar").first();
	console.log("Navbar found:", await navbar.count());

	// Check if it's visible
	if ((await navbar.count()) > 0) {
		const isVisible = await navbar.isVisible();
		console.log("Navbar visible:", isVisible);

		// Get navbar styles
		const styles = await navbar.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				display: computed.display,
				visibility: computed.visibility,
				opacity: computed.opacity,
				position: computed.position,
				top: computed.top,
				zIndex: computed.zIndex,
				background: computed.background,
				backdropFilter: computed.backdropFilter,
			};
		});
		console.log("Navbar styles:", styles);
	}

	// Check for menu button
	const menuButton = await page.locator('[aria-label="Open menu"]').first();
	console.log("Menu button found:", await menuButton.count());

	// Check console errors
	const errors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") {
			errors.push(msg.text());
		}
	});

	if (errors.length > 0) {
		console.log("Console errors:", errors);
	}
});
