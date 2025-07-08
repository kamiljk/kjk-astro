import { test, expect } from "@playwright/test";

test.describe("Horizontal Navbar Tests", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to test page
		await page.goto("http://localhost:4321/navbar-test");
		await page.waitForLoadState("networkidle");
	});

	test("should display horizontal navbar with all components", async ({
		page,
	}) => {
		// Check navbar exists and is visible
		const navbar = page.locator(".navbar-horizontal");
		await expect(navbar).toBeVisible();

		// Check navbar components
		const logo = page.locator(".navbar-logo");
		const searchInput = page.locator("#navbar-search-input");
		const dropdownTrigger = page.locator("#dropdown-trigger");

		await expect(logo).toBeVisible();
		await expect(searchInput).toBeVisible();
		await expect(dropdownTrigger).toBeVisible();

		// Check navbar styling
		const navbarStyles = await navbar.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				position: computed.position,
				zIndex: computed.zIndex,
				backdropFilter: computed.backdropFilter,
				background: computed.background,
			};
		});

		expect(navbarStyles.position).toBe("fixed");
		expect(parseInt(navbarStyles.zIndex)).toBeGreaterThan(1000);
		expect(navbarStyles.backdropFilter).toContain("blur");
	});

	test("should open search results when typing in search input", async ({
		page,
	}) => {
		const searchInput = page.locator("#navbar-search-input");
		const searchPortal = page.locator("#search-portal");
		const dropdownPortal = page.locator("#dropdown-portal");

		// Initially search portal should be hidden
		await expect(searchPortal).toHaveAttribute("hidden");

		// Type in search input
		await searchInput.fill("test search");

		// Search portal should become visible
		await expect(searchPortal).not.toHaveAttribute("hidden");

		// Dropdown should remain closed
		await expect(dropdownPortal).toHaveAttribute("hidden");

		// Clear search
		const clearButton = page.locator("#search-clear");
		await expect(clearButton).toBeVisible();
		await clearButton.click();

		// Search portal should be hidden again
		await expect(searchPortal).toHaveAttribute("hidden");
	});

	test("should open dropdown menu when clicking dropdown trigger", async ({
		page,
	}) => {
		const dropdownTrigger = page.locator("#dropdown-trigger");
		const dropdownPortal = page.locator("#dropdown-portal");
		const searchPortal = page.locator("#search-portal");

		// Initially dropdown should be closed
		await expect(dropdownPortal).toHaveAttribute("hidden");
		await expect(dropdownTrigger).toHaveAttribute("aria-expanded", "false");

		// Click dropdown trigger
		await dropdownTrigger.click();

		// Dropdown should open
		await expect(dropdownPortal).not.toHaveAttribute("hidden");
		await expect(dropdownTrigger).toHaveAttribute("aria-expanded", "true");

		// Search portal should remain closed
		await expect(searchPortal).toHaveAttribute("hidden");

		// Check dropdown content
		const filterButtons = page.locator(".filter-btn");
		const sortButtons = page.locator(".sort-btn");

		await expect(filterButtons.first()).toBeVisible();
		await expect(sortButtons.first()).toBeVisible();
	});

	test("should ensure search and dropdown are mutually exclusive", async ({
		page,
	}) => {
		const searchInput = page.locator("#navbar-search-input");
		const dropdownTrigger = page.locator("#dropdown-trigger");
		const searchPortal = page.locator("#search-portal");
		const dropdownPortal = page.locator("#dropdown-portal");

		// Open search first
		await searchInput.fill("test");
		await expect(searchPortal).not.toHaveAttribute("hidden");

		// Open dropdown - should close search
		await dropdownTrigger.click();
		await expect(dropdownPortal).not.toHaveAttribute("hidden");
		await expect(searchPortal).toHaveAttribute("hidden");

		// Open search again - should close dropdown
		await searchInput.focus();
		await searchInput.fill("new search");
		await expect(searchPortal).not.toHaveAttribute("hidden");
		await expect(dropdownPortal).toHaveAttribute("hidden");
		await expect(dropdownTrigger).toHaveAttribute("aria-expanded", "false");
	});

	test("should verify backdrop filter blur effect", async ({ page }) => {
		// Check browser support for backdrop-filter
		const supportsBackdropFilter = await page.evaluate(() => {
			return (
				CSS.supports("backdrop-filter", "blur(1px)") ||
				CSS.supports("-webkit-backdrop-filter", "blur(1px)")
			);
		});

		console.log("Browser supports backdrop-filter:", supportsBackdropFilter);

		if (!supportsBackdropFilter) {
			console.log(
				"Skipping backdrop-filter test - not supported in this browser"
			);
			return;
		}

		// Open dropdown
		const dropdownTrigger = page.locator("#dropdown-trigger");
		await dropdownTrigger.click();

		const dropdownContainer = page.locator(".dropdown-container");
		await expect(dropdownContainer).toBeVisible();

		// Check backdrop-filter styles
		const containerStyles = await dropdownContainer.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				backdropFilter: computed.backdropFilter,
				webkitBackdropFilter: computed.webkitBackdropFilter,
				background: computed.background,
				isolation: computed.isolation,
				willChange: computed.willChange,
			};
		});

		console.log("Dropdown container styles:", containerStyles);

		// Verify backdrop-filter properties
		expect(
			containerStyles.backdropFilter.includes("blur") ||
				containerStyles.webkitBackdropFilter.includes("blur")
		).toBe(true);

		// Check for performance optimization properties
		expect(containerStyles.isolation).toBe("isolate");
		expect(containerStyles.willChange).toBe("backdrop-filter");
	});

	test("should close dropdown/search when clicking outside", async ({
		page,
	}) => {
		const dropdownTrigger = page.locator("#dropdown-trigger");
		const dropdownPortal = page.locator("#dropdown-portal");

		// Open dropdown
		await dropdownTrigger.click();
		await expect(dropdownPortal).not.toHaveAttribute("hidden");

		// Click outside navbar
		await page.locator(".content-container").click();

		// Dropdown should close
		await expect(dropdownPortal).toHaveAttribute("hidden");
		await expect(dropdownTrigger).toHaveAttribute("aria-expanded", "false");
	});

	test("should close dropdown/search when pressing Escape", async ({
		page,
	}) => {
		const searchInput = page.locator("#navbar-search-input");
		const searchPortal = page.locator("#search-portal");

		// Open search
		await searchInput.fill("test");
		await expect(searchPortal).not.toHaveAttribute("hidden");

		// Press Escape
		await page.keyboard.press("Escape");

		// Search should close
		await expect(searchPortal).toHaveAttribute("hidden");
	});

	test("should have proper responsive behavior", async ({ page }) => {
		const navbar = page.locator(".navbar-horizontal");

		// Test desktop view
		await page.setViewportSize({ width: 1200, height: 800 });
		await expect(navbar).toBeVisible();

		// Test tablet view
		await page.setViewportSize({ width: 768, height: 600 });
		await expect(navbar).toBeVisible();

		// Test mobile view
		await page.setViewportSize({ width: 480, height: 700 });
		await expect(navbar).toBeVisible();

		// Check that search input is still functional on mobile
		const searchInput = page.locator("#navbar-search-input");
		await searchInput.fill("mobile test");

		const searchPortal = page.locator("#search-portal");
		await expect(searchPortal).not.toHaveAttribute("hidden");
	});

	test("should have consistent styling between navbar and dropdown containers", async ({
		page,
	}) => {
		const navbar = page.locator(".navbar-horizontal");
		const dropdownTrigger = page.locator("#dropdown-trigger");

		// Get navbar styles
		const navbarStyles = await navbar.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				background: computed.background,
				backdropFilter: computed.backdropFilter,
				borderRadius: computed.borderRadius,
				boxShadow: computed.boxShadow,
			};
		});

		// Open dropdown
		await dropdownTrigger.click();

		const dropdownContainer = page.locator(".dropdown-container");
		await expect(dropdownContainer).toBeVisible();

		// Get dropdown styles
		const dropdownStyles = await dropdownContainer.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				background: computed.background,
				backdropFilter: computed.backdropFilter,
				boxShadow: computed.boxShadow,
			};
		});

		// Verify consistent styling (same CSS variables should produce similar computed values)
		expect(navbarStyles.background).toBe(dropdownStyles.background);
		expect(navbarStyles.backdropFilter).toBe(dropdownStyles.backdropFilter);
		expect(navbarStyles.boxShadow).toBe(dropdownStyles.boxShadow);
	});

	test("should take screenshot for visual verification", async ({ page }) => {
		// Take screenshot of navbar in default state
		await page.screenshot({
			path: "test-results/navbar-default.png",
			fullPage: true,
		});

		// Open dropdown and take screenshot
		const dropdownTrigger = page.locator("#dropdown-trigger");
		await dropdownTrigger.click();

		await page.screenshot({
			path: "test-results/navbar-dropdown-open.png",
			fullPage: true,
		});

		// Close dropdown and open search
		await page.keyboard.press("Escape");

		const searchInput = page.locator("#navbar-search-input");
		await searchInput.fill("search test");

		await page.screenshot({
			path: "test-results/navbar-search-open.png",
			fullPage: true,
		});
	});
});
