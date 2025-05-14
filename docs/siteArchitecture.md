# Astro Site Architecture: Source of Truth

This document serves as the authoritative reference for the site's architecture, component interactions, and responsive behavior. It defines the expected behavior, responsibilities, and boundaries for each component to ensure consistent development and maintenance.

## Core Architecture Principles

This site follows Astro's "Islands Architecture" pattern, which provides:

1. **Zero JavaScript by default** - Only components explicitly marked with client directives receive JavaScript

2. **Strategic hydration** - Interactive components are hydrated only when needed

3. **Performance first** - Minimal client-side JavaScript for optimal loading and interaction speed

## 0. Design System & Foundations

### A. Fluid Type & Space Scaling (Utopia)

- All typography and spacing must use fluid scaling, interpolating between min and max values based on viewport width, as described at [utopia.fyi](https://utopia.fyi/).
- No arbitrary breakpoints for type/space; use CSS clamp() and variables for all scaling.
- Reference: [Utopia Type Calculator](https://utopia.fyi/type/calculator), [Utopia Space Calculator](https://utopia.fyi/space/calculator)

### B. Design Tokens & Variables

- All design decisions (type, space, color, radius, etc.) must be implemented as CSS custom properties (variables) or design tokens.
- Tokens should be defined in a central location (e.g., `:root` in global.css or a dedicated tokens.css file).
- Components must consume tokens/variables, not hardcoded values.

### C. Font-Face & Theme System

- Font faces must be declared in global CSS using `@font-face`.
- The site must support at least two themes: "neon" (vivid, high-contrast) and "neutral" (muted, accessible), switchable via a theme toggle.
- Theme colors, backgrounds, and effects must be implemented using CSS variables and toggled at the root level.

### D. Parallax Dot Grid Background

- The site background must include a subtle parallax dot grid.
- The dot grid scrolls at a slower rate than the main content, creating a parallax effect.
- Implementation: Use a fixed or absolutely positioned SVG/CSS grid, with a scroll event or CSS scroll-linked animation to create the parallax.
- The grid must be visually subtle and not interfere with content legibility.

## Layout Sizing & Ratios

- **Feed max-width:** 840px (fluid, but capped at 840px on large screens)
- **NavBar background max-width:** 840px + 2rem (i.e., 1rem extra on each side of the feed/cards)
- **Horizontal gap between NavBar and feed/cards:** 1rem
- **Feed/cards and NavBar content are always centered within their respective containers**
- **All spacing and sizing use design tokens and fluid scaling (Utopia-compliant) where possible**
- **NavBar background (blurred/floating) must visually extend 1rem beyond feed/cards on each side, but NavBar content aligns with feed/cards**

## I. Visual Component Layout

### Desktop Layout

```ascii
+--------------------------------------------------------------------------------------+
| Browser Viewport (Desktop)                                                           |
| +----------------------------------------------------------------------------------+ |
| | [ Navbar.astro (Fixed Top - Astro Component) ]                                   | |
| |   - Logo (.nav__logo-img)                                                        | |
| |   - (Search - commented out)                                                     | |
| |   - [ NavbarMenu Button (triggers NavbarMenu.jsx Island) ]                       | |
| |     (Height: var(--navbar-height) from global.css)                               | |
| |     (CSS: global.css, Navbar.astro <style>)                                      | |
| +----------------------------------------------------------------------------------+ |
| +----------------------------------------------------------------------------------+ |
| | [ Main Content Area (BaseLayout.astro > .site-container > main - Astro Component)] |
| |   (CSS: padding-top: var(--navbar-height) to avoid overlap)                      | |
| |                                                                                  | |
| |   [ Feed (ul#posts-feed) - Rendered by BaseLayout/Feed.jsx ]                     | |
| |     (Data: Initial from Astro page, then client-side via API for infinite scroll)| |
| |     (Styling: global.css for .post-card, inline styles in Feed.jsx for list)     | |
| |                                                                                  | |
| |     +------------------------------------------------------------------------+   | |
| |     | Post 1 (li.post-card)                                                  |   | |
| |     |   - Thumbnail (if game)                                                |   | |
| |     |   - Title (a href="/posts/[slug1]")                                    |   | |
| |     |   - Description (.post-description)                                    |   | |
| |     +------------------------------------------------------------------------+   | |
| |     +------------------------------------------------------------------------+   | |
| |     | Post 2 (li.post-card)                                                  |   | |
| |     |   ...                                                                  |   | |
| |     +------------------------------------------------------------------------+   | |
| |     ... (Scroll down) ...                                                        | |
| |   [ Loader (#feed-loader / Feed.jsx loader div) ]                                | |
| |     (JS: IntersectionObserver in BaseLayout.astro <script> or Feed.jsx Island)   | |
| |     (CSS: inline styles in Feed.jsx, or global.css)                              | |
| |                                                                                  | |
| +----------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------+
```

### Mobile Layout

```ascii
+------------------------------------------+
| Browser Viewport (Mobile)                |
| +--------------------------------------+ |
| | [ Navbar.astro (Fixed Top) ]         | |
| |   - Logo                             | |
| |   - [ NavbarMenu Button (prominent)] | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [ Main Content Area ]                | |
| |   (padding-top: var(--navbar-height))| |
| |                                      | |
| |   [ Feed (ul#posts-feed) ]           | |
| |     +----------------------------+   | |
| |     | Post 1 (li.post-card)      |   | |
| |     | (Full width, stacked)      |   | |
| |     +----------------------------+   | |
| |     +----------------------------+   | |
| |     | Post 2 (li.post-card)      |   | |
| |     | ...                        |   | |
| |     +----------------------------+   | |
| |     ... (Scroll down) ...            | |
| |   [ Loader ]                         | |
| |                                      | |
| +--------------------------------------+ |
+------------------------------------------+
```

### NavbarMenu (Dropdown/Overlay)

#### Desktop

```ascii
+-------------------------------+
|      NavbarMenu.jsx           |
|-------------------------------|
|  - Filter Pills (type)        |
|  - Sort Pills (sort/order)    |
|  - Theme Toggle               |
+-------------------------------+
```

#### Mobile

```ascii
+------------------------------------------+
| Browser Viewport (Mobile - Menu Open)    |
| +--------------------------------------+ |
| | [ Navbar.astro (Fixed Top) ]         | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [ NavbarMenu.jsx (Island - Dropdown)]| |
| |   (Full-width on mobile)            | |
| |   - Filter Options (Pills)           | |
| |   - Sort Options (Pills)             | |
| |   - Theme Toggle                     | |
| |   (Styling: CSS Modules + global.css)| |
| +--------------------------------------+ |
| | [ Main Content Area (Obscured/Below)]| |
| +--------------------------------------+ |
+------------------------------------------+
```

## II. Component Contract Specifications

### A. Component Responsibilities & Boundaries

| Component | Responsibility | Input Props/Data | Output/Effects | Constraints |
|-----------|----------------|------------------|----------------|-------------|
| `BaseLayout.astro` | Page structure, navbar inclusion | `title`, `content` | HTML structure, navbar | Static component, no client-side state |
| `Navbar.astro` | Navigation header | None | Fixed header with menu trigger | Static, must maintain `--navbar-height` |
| `NavbarMenu.jsx` | Filter/sort UI | `client:idle` directive | URL parameter updates | Must use URL params, not direct state |
| `Feed.jsx` | Post listing with infinite scroll | `type`, `sort`, `order`, `client:visible` directive | Rendered post list | Must fetch from `/api/feed.json` |
| `[slug].astro` | Single post display | URL param `slug` | Full post content | Must use BaseLayout |

### B. Data Flow Reference

```ascii
+--------------------+     +--------------------+     +--------------------+
| URL Parameters     |---->| Astro Page         |---->| Initial HTML       |
| (type, sort, order)|     | (index.astro)      |     | (BaseLayout.astro) |
+--------------------+     +--------------------+     +--------------------+
         ^                         |                         |
         |                         v                         v
+--------------------+     +--------------------+     +--------------------+
| NavbarMenu.jsx     |<----| Client Hydration   |     | Feed Component     |
| (Updates URL)      |     | (Islands)          |     | (Hydrated Island)  |
+--------------------+     +--------------------+     +--------------------+
                                                             |
                                                             v
                                                      +--------------------+
                                                      | API Request        |
                                                      | (/api/feed.json)   |
                                                      +--------------------+
                                                             |
                                                             v
                                                      +--------------------+
                                                      | Update DOM         |
                                                      | (More Posts)       |
                                                      +--------------------+
```

## III. User Interaction Flows

### A. Initial Page Load

```ascii
[User lands on page]
      |
      v
[Navbar.astro visible at top]
      |
      v
[Feed.jsx loads initial posts]
      |
      v
[User scrolls]
      |
      v
[Loader appears, more posts fetched]
```

### B. Using NavbarMenu

```ascii
[User clicks NavbarMenu button]
      |
      v
[NavbarMenu.jsx dropdown appears]
      |
      v
[User selects filter/sort]
      |
      v
[URL updates, page reloads, new posts shown]
```

### C. Opening a Post

```ascii
[User clicks post title]
      |
      v
[Post detail page loads]
      |
      v
[Navbar remains visible, post content displayed]
```

## IV. Project Structure

Recommended project structure for the Astro site:

```
src/
├── components/
│   ├── common/        # Shared static UI components
│   ├── features/      # Feature-specific components
│   └── islands/       # Interactive components (React/islands)
├── layouts/           # Page layouts like BaseLayout.astro
├── pages/             # Page routes
├── content/           # Content collections
├── styles/            # Global styles
└── utils/             # Utility functions
```

### E. Astro Content Collections

- Use Astro Content Collections for all structured content (e.g., blog posts, docs, projects) that benefits from type safety, frontmatter validation, and easy querying.
- Do NOT use Content Collections for purely presentational or ephemeral data (e.g., UI state, temporary client-side data).
- Collections should be defined in `src/content/` and referenced via Astro's content API.
- All content-driven pages (e.g., posts, guides) must source their data from Content Collections for consistency and maintainability.

## V. Implementation Guidelines

### A. Component Structure Rules

1. **Astro Components for Static UI**:
   - `BaseLayout.astro`: Main layout structure
   - `Navbar.astro`: Navigation header
   - Page components: `index.astro`, `[slug].astro`, etc.

2. **Islands for Interactive UI**:
   - `NavbarMenu.jsx`: Dropdown menu with filter/sort options (`client:idle`)
   - `Feed.jsx`: Infinite scrolling post list (`client:visible`)

3. **Client Directive Selection Guide**:
   - `client:load`: Only for critical above-the-fold interactive components
   - `client:idle`: For non-critical UI elements that should load after main page content
   - `client:visible`: For components that should only hydrate when scrolled into view
   - `client:media`: For components that should only load on certain screen sizes

### B. Styling Standards

```text
+------------------------+---------------------------+---------------------------+
| Style Type            | Acceptable Location       | Prohibited Location       |
+------------------------+---------------------------+---------------------------+
| Global Styles         | global.css                | Inline in components      |
| Layout Variables      | CSS Custom Properties     | Hard-coded values         |
| Component-Specific    | style in .astro files     | Inline in JSX             |
|                       | CSS Modules for islands   |                           |
| Dynamic/Reactive      | Minimal inline in JSX     | Extensive in JSX          |
+------------------------+---------------------------+---------------------------+
```

### C. Performance Optimization Techniques

1. **Strategic Client Directives**
   - Use appropriate client directives based on component visibility and importance
   - Default to no hydration (static HTML) whenever possible

2. **Asset Optimization**
   - Implement view transitions for smoother navigation between pages
   - Use dynamic imports for heavy components
   - Implement proper image optimization with Astro's Image integration

3. **Data Management**
   - Leverage Astro's Content Collections for content-heavy features
   - Consider server islands (`server:defer`) for dynamic but cacheable content

### D. Responsive Design Requirements

#### Breakpoint Definitions

| Breakpoint Name | Width Range | Layout Behavior |
|----------------|-------------|----------------|
| Mobile | < 640px | Single column, full-width posts, simplified navbar |
| Tablet | 640px - 1024px | 2-column post grid, standard navbar |
| Desktop | > 1024px | Multi-column layout, full navbar features |

#### Critical Responsive Elements

1. **Navbar**
   - Must maintain fixed position across all viewports
   - Height must be defined by `--navbar-height` CSS variable
   - Menu button must be more prominent on smaller viewports

2. **Feed**
   - Must adapt from multi-column to single-column on smaller viewports
   - Post styling must remain consistent across viewports
   - Infinite scrolling behavior must work identically on all devices

3. **NavbarMenu**
   - On mobile: Full-width dropdown
   - On desktop: Compact dropdown positioned below the navbar

## VI. Testing & Validation

### A. Architecture Compliance Tests

| Feature | Test Condition | Expected Result | Playwright Test Category |
|---------|----------------|-----------------|-------------------------|
| Navbar Positioning | Scrolling page | Remains fixed at top | Navigation |
| Content Padding | All viewports | No overlap with navbar | Navigation |
| Menu Interaction | Click menu button | Dropdown appears | Navigation |
| Filter Selection | Click filter pill | URL updates, feed changes | Navigation |
| Post Opening | Click post title | Navigates to post detail | Navigation |
| Infinite Scroll | Scroll to bottom | More posts load | Navigation |
| Responsive Layout | Various viewports | Layout adapts correctly | Responsive |

### B. Performance Tests

| Test | Tool | Metric | Target |
|------|------|--------|--------|
| JavaScript Size | Lighthouse | Total JavaScript | < 100KB |
| Time to Interactive | Lighthouse | TTI | < 3.8s |
| Islands Hydration | Performance Timeline | Custom Marks | < 200ms per island |

## VII. Implementation Check Matrix

Use this table when implementing or modifying code to ensure compliance:

| Code Change Category | Key Questions | Compliance Rule |
|---------------------|---------------|----------------|
| Component Structure | Is this UI static or interactive? | Static → Astro component / Interactive → React Island |
| Client Directive | When should this component hydrate? | Above fold → client:load / Secondary → client:idle / Below fold → client:visible |
| Data Flow | How does data move between components? | Follow the data flow diagram in Section II.B |
| Styling | Where should this style live? | Follow the style standards in Section V.B |
| Responsive Behavior | How does this behave on different devices? | Follow the responsive requirements in Section V.D |
| Performance | Will this impact load time? | Use Performance Tests in Section VI.B |

---

Use this guide as the definitive reference when making changes to the site architecture. All modifications should comply with the principles, patterns, and specifications outlined herein to ensure optimal performance, maintainability, and user experience.
