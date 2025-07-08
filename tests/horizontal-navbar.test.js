import { test, expect } from "@playwright/test";

test.describe("Horizontal Navbar", () => {
	test("should display logo, search form, and dropdown button", async ({
		page,
	}) => {
		await page.goto("/");

		// Check for logo
		const logo = await page.locator(".navbar-logo");
		await expect(logo).toBeVisible();

		// Check for search form
		const searchForm = await page.locator(".navbar-search");
		await expect(searchForm).toBeVisible();

		// Check for dropdown button
		const dropdownButton = await page.locator(".navbar-dropdown");
		await expect(dropdownButton).toBeVisible();
	});

	test("should toggle dropdown menu and dismiss search results", async ({
		page,
	}) => {
		await page.goto("/");

		// Open dropdown menu
		const dropdownButton = await page.locator(".navbar-dropdown button");
		await dropdownButton.click();

		const dropdownMenu = await page.locator("#shared-container");
		await expect(dropdownMenu).toBeVisible();

		// Open search results
		const searchInput = await page.locator(".pagefind-ui__search-input");
		await searchInput.fill("test");

		// Ensure dropdown menu is dismissed
		await expect(dropdownMenu).not.toBeVisible();
	});

	test("should toggle search results and dismiss dropdown menu", async ({
		page,
	}) => {
		await page.goto("/");

		// Open search results
		const searchInput = await page.locator(".pagefind-ui__search-input");
		await searchInput.fill("test");

		const searchResults = await page.locator("#shared-container");
		await expect(searchResults).toBeVisible();

		// Open dropdown menu
		const dropdownButton = await page.locator(".navbar-dropdown button");
		await dropdownButton.click();

		// Ensure search results are dismissed
		await expect(searchResults).not.toBeVisible();
	});
});
