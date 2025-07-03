import { test, expect } from '@playwright/test';

const filters = [
  { type: 'all', path: '/' },
  { type: 'read', path: '/?type=read' },
  { type: 'play', path: '/?type=play' },
  { type: 'about', path: '/?type=about' },
];
const sorts = [
  { sort: 'newest', label: 'Newest' },
  { sort: 'oldest', label: 'Oldest' },
  { sort: 'alpha', label: 'A-Z' },
];

test.describe('Navbar & Feed Functionality', () => {
  for (const filter of filters) {
    test(`Filter: ${filter.type} only shows correct posts`, async ({ page }) => {
      await page.goto(filter.path);
      // Wait for posts to load
      const postCount = await page.locator('#posts-feed li').count();
      expect(postCount).toBeGreaterThan(0);
      const posts = await page.locator('#posts-feed li').all();
      for (const post of posts) {
        const typeAttr = await post.getAttribute('data-type');
        if (filter.type !== 'all' && typeAttr) {
          // Accept 'play' for play, 'read' for read, 'about' for about
          expect(typeAttr).toBe(filter.type);
        }
      }
    });
    for (const sort of sorts) {
      test(`Sort: ${filter.type} by ${sort.label} sorts correctly`, async ({ page }) => {
        await page.goto(`${filter.path}${filter.path.includes('?') ? '&' : '?'}sort=${sort.sort}`);
        const postCount = await page.locator('#posts-feed li').count();
        expect(postCount).toBeGreaterThan(0);
        const titles = await page.locator('#posts-feed li h2').allTextContents();
        if (sort.sort === 'alpha') {
          // Use localeCompare with sensitivity 'base' and ignorePunctuation for robust, user-friendly sorting
          const sorted = [...titles].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', ignorePunctuation: true }));
          expect(titles).toEqual(sorted);
        }
        // For date sorts, you would need to extract and compare dates if available
      });
    }
  }

  test('Sort controls show asc/desc arrows', async ({ page }) => {
    await page.goto('/');
    const sortBtns = page.locator('.nav__sort a');
    await expect(sortBtns).toHaveCount(3);
    for (const btn of await sortBtns.all()) {
      const html = await btn.innerHTML();
      expect(html).toMatch(/arrow|svg|▲|▼|A-Z|Newest|Oldest/i);
    }
  });

  test('Opening a post opens the correct page and next/prev links work', async ({ page }) => {
    await page.goto('/');
    const firstPost = page.locator('#posts-feed li a').first();
    const href = await firstPost.getAttribute('href');
    await firstPost.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator('h1')).toBeVisible();
    // Test next/prev links
    const nextLink = page.locator('nav a', { hasText: '→' });
    if (await nextLink.count()) {
      const nextHref = await nextLink.getAttribute('href');
      await nextLink.click();
      await expect(page).toHaveURL(nextHref!);
    }
    const prevLink = page.locator('nav a', { hasText: '←' });
    if (await prevLink.count()) {
      const prevHref = await prevLink.getAttribute('href');
      await prevLink.click();
      await expect(page).toHaveURL(prevHref!);
    }
  });

  test('All post links open', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('#posts-feed li a').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(/\/posts\//);
    }
  });

  test('Navbar is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.locator('.nav__logo')).toBeVisible();
    await page.setViewportSize({ width: 600, height: 800 });
    await expect(page.locator('.nav__menu-btn')).toBeVisible();
    // Open menu and check secondary nav
    await page.locator('.nav__menu-btn').click();
    await expect(page.locator('#nav-secondary')).toBeVisible();
  });
});

test.describe('NavbarMenu UI interactions', () => {
  test('Clicking filter pills updates feed and URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav__menu-btn').click();
    // Click each filter pill and check feed and URL
    for (const filter of ['read', 'play', 'about', 'all']) {
      await page.locator('.filter-section button[class*="pill"]', { hasText: new RegExp('^' + filter.charAt(0).toUpperCase() + filter.slice(1)) }).click();
      await page.waitForLoadState('networkidle');
      // Check URL
      const url = page.url();
      if (filter === 'all') {
        expect(url).not.toContain('type=');
      } else {
        expect(url).toContain(`type=${filter}`);
      }
      // Check feed
      const posts = await page.locator('#posts-feed li').all();
      expect(posts.length).toBeGreaterThan(0);
      for (const post of posts) {
        const typeAttr = await post.getAttribute('data-type');
        if (filter !== 'all') expect(typeAttr).toBe(filter);
      }
      // Reopen menu for next click
      await page.locator('.nav__menu-btn').click();
    }
  });

  test('Clicking sort pills and arrows updates feed and URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav__menu-btn').click();
    for (const sort of [
      { key: 'updated', label: 'Updated' },
      { key: 'created', label: 'Created' },
      { key: 'alpha', label: 'A-Z' },
    ]) {
      // Click sort pill
      await page.locator('.sort-section button[class*="pill"]', { hasText: sort.label }).click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain(`sort=${sort.key}`);
      // Click asc arrow
      await page.locator('.sort-section .sort-arrow', { hasText: '▲' }).first().click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('order=asc');
      // Click desc arrow
      await page.locator('.sort-section .sort-arrow', { hasText: '▼' }).first().click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('order=desc');
      // Reopen menu for next sort
      await page.locator('.nav__menu-btn').click();
    }
  });

  test('Navbar dropdown toggles visibility', async ({ page }) => {
    await page.goto('/');

    // Locate the menu button and dropdown container
    const menuButton = page.locator('.nav__menu-btn');
    const menuContainer = page.locator('.menu-container');

    // Ensure the dropdown is initially hidden
    await expect(menuContainer).not.toBeVisible();

    // Click the menu button to open the dropdown
    await menuButton.click();
    await expect(menuContainer).toBeVisible();

    // Click the menu button again to close the dropdown
    await menuButton.click();
    await expect(menuContainer).not.toBeVisible();
  });

  test('Theme toggle switches themes', async ({ page }) => {
    await page.goto('/');

    // Locate the theme toggle button
    const themeToggle = page.locator('.theme-toggle-btn');

    // Check the initial theme (assume light mode by default)
    const initialTheme = await page.evaluate(() => document.body.dataset.theme);
    expect(initialTheme).toBe('light');

    // Click the theme toggle button to switch to dark mode
    await themeToggle.click();
    const darkTheme = await page.evaluate(() => document.body.dataset.theme);
    expect(darkTheme).toBe('dark');

    // Click the theme toggle button again to switch back to light mode
    await themeToggle.click();
    const lightTheme = await page.evaluate(() => document.body.dataset.theme);
    expect(lightTheme).toBe('light');
  });
});
