import { test, expect } from "@playwright/test";

test("dropdown liquid glass effect", async ({ page }) => {
	// Navigate to the homepage
	await page.goto("http://localhost:4322/");

	// Wait for page to load
	await page.waitForLoadState("networkidle");

	// Find the dropdown button
	const dropdownButton = await page.locator('[aria-label="Open menu"]').first();
	expect(await dropdownButton.count()).toBe(1);

	console.log("✅ Dropdown button found");

	// Click to open dropdown
	await dropdownButton.click();

	// Wait for dropdown to appear
	await page.waitForTimeout(500);

	// Check if dropdown is visible
	const dropdown = await page.locator(".dropdown-menu").first();
	const isVisible = await dropdown.isVisible();
	expect(isVisible).toBe(true);

	console.log("✅ Dropdown is visible");

	// Check dropdown liquid glass styles
	const dropdownStyles = await dropdown.evaluate((el) => {
		const computed = window.getComputedStyle(el);
		return {
			background: computed.background,
			backdropFilter: computed.backdropFilter,
			border: computed.border,
			borderRadius: computed.borderRadius,
			boxShadow: computed.boxShadow,
		};
	});

	console.log("🎨 Dropdown styles:", dropdownStyles);

	// Verify liquid glass properties on dropdown
	expect(dropdownStyles.backdropFilter).toContain("blur");
	expect(dropdownStyles.background).toContain("rgba(255, 255, 255, 0.18)");
	expect(dropdownStyles.borderRadius).toBe("24px"); // 1.5rem = 24px

	console.log("✅ Dropdown liquid glass effect confirmed");

	// Check if dropdown pills are visible and functional
	const filterPills = await page.locator(".dropdown-menu .pill").all();
	expect(filterPills.length).toBeGreaterThan(0);

	console.log(`✅ Found ${filterPills.length} filter pills in dropdown`);

	// Take a screenshot for visual verification
	await page.screenshot({
		path: "tests/dropdown-liquid-glass-test.png",
		fullPage: true,
	});

	console.log("📸 Screenshot saved to tests/dropdown-liquid-glass-test.png");
	console.log("🎉 All dropdown liquid glass tests passed!");
});
