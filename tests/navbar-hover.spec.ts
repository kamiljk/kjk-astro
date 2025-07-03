import { test, expect } from "@playwright/test";

test.describe("Navbar Menu Hover Effects", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page where the navbar is visible
    await page.goto("/");

    // Open the navbar menu
    const menuToggle = page.locator("button[aria-label='Open menu']");
    await menuToggle.click();

    // Wait for the menu to be visible
    await expect(page.locator("#filter-sort-menu")).toBeVisible();
  });

  test("non-active filter button should have a neon green hover effect", async ({ page }) => {
    // Target the second filter pill button (should not be active)
    const filterButton = page.locator('#filter-sort-menu button[class*="pill"]').nth(1);

    // Hover over the button
    await filterButton.hover();

    // Assert the background color changes to neon green
    await expect(filterButton).toHaveCSS("background-color", "rgb(57, 255, 20)");
    await expect(filterButton).toHaveCSS("color", "rgb(17, 17, 17)");
  });

  test("non-active sort button should have a neon green hover effect", async ({ page }) => {
    // Target the second sort arrow button (should not be active)
    const sortButton = page.locator('#filter-sort-menu button[class*="sort-arrow"]').nth(1);

    // Hover over the button
    await sortButton.hover();

    // Assert the background color changes to neon green
    await expect(sortButton).toHaveCSS("background-color", "rgb(57, 255, 20)");
    await expect(sortButton).toHaveCSS("color", "rgb(17, 17, 17)");
  });
});
