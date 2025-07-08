import { test, expect } from "@playwright/test";

test("liquid glass navbar functionality", async ({ page }) => {
	// Navigate to the homepage
	await page.goto("http://localhost:4322/");

	// Wait for page to load
	await page.waitForLoadState("networkidle");

	// Check if navbar exists and has liquid glass class
	const navbar = await page.locator(".navbar.liquid-glass-navbar").first();
	expect(await navbar.count()).toBe(1);

	console.log("✅ Navbar with liquid-glass-navbar class found");

	// Check if navbar is visible
	const isVisible = await navbar.isVisible();
	expect(isVisible).toBe(true);
	console.log("✅ Navbar is visible");

	// Check for dropdown button
	const dropdownButton = await page.locator('[aria-label="Open menu"]').first();
	expect(await dropdownButton.count()).toBe(1);
	console.log("✅ Dropdown button found");

	// Check navbar styles for liquid glass effect
	const navbarStyles = await navbar.evaluate((el) => {
		const computed = window.getComputedStyle(el);
		return {
			background: computed.background,
			backdropFilter: computed.backdropFilter,
			border: computed.border,
			position: computed.position,
			zIndex: computed.zIndex,
		};
	});

	console.log("🎨 Navbar styles:", navbarStyles);

	// Verify key liquid glass properties
	expect(navbarStyles.backdropFilter).toContain("blur");
	expect(navbarStyles.position).toBe("fixed");
	expect(parseInt(navbarStyles.zIndex)).toBeGreaterThan(50);

	console.log("✅ Liquid glass effect properties confirmed");

	// Test dropdown functionality
	await dropdownButton.click();

	// Wait for dropdown to appear
	await page.waitForTimeout(500);

	// Check if dropdown opened
	const isDropdownOpen = await dropdownButton.getAttribute("aria-expanded");
	expect(isDropdownOpen).toBe("true");
	console.log("✅ Dropdown opens when clicked");

	// Take a screenshot for visual verification
	await page.screenshot({
		path: "tests/navbar-liquid-glass-test.png",
		fullPage: true,
	});

	console.log("📸 Screenshot saved to tests/navbar-liquid-glass-test.png");
	console.log("🎉 All navbar liquid glass tests passed!");
});
