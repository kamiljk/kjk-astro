# Test info

- Name: NavbarMenu UI interactions >> Theme toggle switches themes
- Location: /Users/kamil/Desktop/kjk-astro/tests/navigation.spec.ts:171:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "light"
Received: undefined
    at /Users/kamil/Desktop/kjk-astro/tests/navigation.spec.ts:179:26
```

# Page snapshot

```yaml
- banner:
  - link "Logo":
    - /url: /
    - img "Logo"
  - textbox "Search (coming soon)" [disabled]
  - button "Open menu":
    - img
- main:
  - list:
    - listitem:
      - link "Bitface":
        - /url: /posts/bitface/
      - text: 1 week ago A pixel art game where you can create and customize faces. DIVE IN
      - img "Thumbnail for Bitface"
    - listitem:
      - link "Click Jazz":
        - /url: /posts/click-jazz/
      - text: 3 weeks ago An engaging clicker game that uses behavioral reinforcement techniques to keep players entertained and coming back for more. EXPERIENCE
      - img "Thumbnail for Click Jazz"
    - listitem:
      - link "P505 Drum Machine":
        - /url: /posts/p505/
      - text: 3 weeks ago An implementation of some of the Roland TR-808 drum machine sequencer functionality, using P5. DISCOVER
      - img "Thumbnail for P505 Drum Machine"
    - listitem:
      - link "Test Post":
        - /url: /posts/about-attributions/
      - text: Mar 2025 – 4 weeks ago This is a test post for CardGrid. LAUNCH
    - listitem:
      - link "Colophon":
        - /url: /posts/about-colophon/
      - text: Mar 2025 Technical details about how this site was designed, built and deployed DISCOVER
    - listitem:
      - link "About Me":
        - /url: /posts/about-me/
      - text: Mar 2025 I'm a developer and designer exploring interactive web experiences. This site showcases my portfolio, games, and writing. I love combining code, art, and storytelling. LAUNCH
    - listitem:
      - link "Bad Ghost":
        - /url: /posts/badghost/
      - text: Mar 2025 – 3 weeks ago This ghost Pls help ghots. LAUNCH
      - img "Thumbnail for Bad Ghost"
    - listitem:
      - link "Discourse":
        - /url: /posts/discourse/
      - text: Mar 2025 Systems of thought, communication, and expression that shape and are shaped by social structures, power relations, and knowledge production. IMMERSE
    - listitem:
      - link "Electro Ball":
        - /url: /posts/electro-ball/
      - text: Mar 2025 Control a charged ball with device motion. INTERACT
      - img "Thumbnail for Electro Ball"
```

# Test source

```ts
   79 |   test('All post links open', async ({ page }) => {
   80 |     await page.goto('/');
   81 |     const links = await page.locator('#posts-feed li a').all();
   82 |     for (const link of links) {
   83 |       const href = await link.getAttribute('href');
   84 |       expect(href).toMatch(/\/posts\//);
   85 |     }
   86 |   });
   87 |
   88 |   test('Navbar is responsive', async ({ page }) => {
   89 |     await page.setViewportSize({ width: 1200, height: 800 });
   90 |     await page.goto('/');
   91 |     await expect(page.locator('.nav__logo')).toBeVisible();
   92 |     await page.setViewportSize({ width: 600, height: 800 });
   93 |     await expect(page.locator('.nav__menu-btn')).toBeVisible();
   94 |     // Open menu and check secondary nav
   95 |     await page.locator('.nav__menu-btn').click();
   96 |     await expect(page.locator('#nav-secondary')).toBeVisible();
   97 |   });
   98 | });
   99 |
  100 | test.describe('NavbarMenu UI interactions', () => {
  101 |   test('Clicking filter pills updates feed and URL', async ({ page }) => {
  102 |     await page.goto('/');
  103 |     await page.locator('.nav__menu-btn').click();
  104 |     // Click each filter pill and check feed and URL
  105 |     for (const filter of ['read', 'play', 'about', 'all']) {
  106 |       await page.locator('.filter-section .pill', { hasText: new RegExp('^' + filter.charAt(0).toUpperCase() + filter.slice(1)) }).click();
  107 |       await page.waitForLoadState('networkidle');
  108 |       // Check URL
  109 |       const url = page.url();
  110 |       if (filter === 'all') {
  111 |         expect(url).not.toContain('type=');
  112 |       } else {
  113 |         expect(url).toContain(`type=${filter}`);
  114 |       }
  115 |       // Check feed
  116 |       const posts = await page.locator('#posts-feed li').all();
  117 |       expect(posts.length).toBeGreaterThan(0);
  118 |       for (const post of posts) {
  119 |         const typeAttr = await post.getAttribute('data-type');
  120 |         if (filter !== 'all') expect(typeAttr).toBe(filter);
  121 |       }
  122 |       // Reopen menu for next click
  123 |       await page.locator('.nav__menu-btn').click();
  124 |     }
  125 |   });
  126 |
  127 |   test('Clicking sort pills and arrows updates feed and URL', async ({ page }) => {
  128 |     await page.goto('/');
  129 |     await page.locator('.nav__menu-btn').click();
  130 |     for (const sort of [
  131 |       { key: 'updated', label: 'Updated' },
  132 |       { key: 'created', label: 'Created' },
  133 |       { key: 'alpha', label: 'A-Z' },
  134 |     ]) {
  135 |       // Click sort pill
  136 |       await page.locator('.sort-section .pill', { hasText: sort.label }).click();
  137 |       await page.waitForLoadState('networkidle');
  138 |       expect(page.url()).toContain(`sort=${sort.key}`);
  139 |       // Click asc arrow
  140 |       await page.locator('.sort-section .sort-arrow', { hasText: '▲' }).first().click();
  141 |       await page.waitForLoadState('networkidle');
  142 |       expect(page.url()).toContain('order=asc');
  143 |       // Click desc arrow
  144 |       await page.locator('.sort-section .sort-arrow', { hasText: '▼' }).first().click();
  145 |       await page.waitForLoadState('networkidle');
  146 |       expect(page.url()).toContain('order=desc');
  147 |       // Reopen menu for next sort
  148 |       await page.locator('.nav__menu-btn').click();
  149 |     }
  150 |   });
  151 |
  152 |   test('Navbar dropdown toggles visibility', async ({ page }) => {
  153 |     await page.goto('/');
  154 |
  155 |     // Locate the menu button and dropdown container
  156 |     const menuButton = page.locator('.nav__menu-btn');
  157 |     const menuContainer = page.locator('.menu-container');
  158 |
  159 |     // Ensure the dropdown is initially hidden
  160 |     await expect(menuContainer).not.toBeVisible();
  161 |
  162 |     // Click the menu button to open the dropdown
  163 |     await menuButton.click();
  164 |     await expect(menuContainer).toBeVisible();
  165 |
  166 |     // Click the menu button again to close the dropdown
  167 |     await menuButton.click();
  168 |     await expect(menuContainer).not.toBeVisible();
  169 |   });
  170 |
  171 |   test('Theme toggle switches themes', async ({ page }) => {
  172 |     await page.goto('/');
  173 |
  174 |     // Locate the theme toggle button
  175 |     const themeToggle = page.locator('.theme-toggle-btn');
  176 |
  177 |     // Check the initial theme (assume light mode by default)
  178 |     const initialTheme = await page.evaluate(() => document.body.dataset.theme);
> 179 |     expect(initialTheme).toBe('light');
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  180 |
  181 |     // Click the theme toggle button to switch to dark mode
  182 |     await themeToggle.click();
  183 |     const darkTheme = await page.evaluate(() => document.body.dataset.theme);
  184 |     expect(darkTheme).toBe('dark');
  185 |
  186 |     // Click the theme toggle button again to switch back to light mode
  187 |     await themeToggle.click();
  188 |     const lightTheme = await page.evaluate(() => document.body.dataset.theme);
  189 |     expect(lightTheme).toBe('light');
  190 |   });
  191 | });
  192 |
```