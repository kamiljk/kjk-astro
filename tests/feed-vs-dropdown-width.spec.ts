import { test, expect } from '@playwright/test';

// This test checks that the feed and dropdown have different widths

test.describe('Feed vs Dropdown Width', () => {
  test('Feed and dropdown should have different widths', async ({ page }) => {
    await page.goto('/');
    // Wait for feed to be visible
    await page.waitForSelector('#posts-feed');
    // Open the dropdown menu
    await page.click('.nav__menu-btn');
    // Wait for dropdown to be visible
    await page.waitForSelector('.menu-content');

    const dropdownWidth = await page.$eval('.menu-content', el => (el instanceof HTMLElement ? el.offsetWidth : 0));
    const feedWidth = await page.$eval('#posts-feed', el => (el instanceof HTMLElement ? el.offsetWidth : 0));

    // Log widths for debugging
    console.log('Dropdown width:', dropdownWidth, 'Feed width:', feedWidth);

    expect(dropdownWidth).not.toBe(feedWidth);
  });
});
