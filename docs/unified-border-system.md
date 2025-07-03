# Unified Border Design System

## Overview

This document describes the unified border system implemented across the navbar, dropdown, feed items, and other UI components to ensure visual consistency throughout the application.

## Border Token Hierarchy

### 1. Frosted Glass Elements

**Token:** `--frosted-border`
**Definition:** `1px solid var(--color-border)`
**Usage:** For elements with frosted glass effects (blur + transparency)

**Components:**

- Navbar (`.site-header`)
- Dropdown menu (`.menu-container`)
- Search results (`.pagefind-ui__results`)

### 2. Regular Content Elements

**Token:** `--border-unified`
**Definition:** `1px solid var(--color-border)`
**Usage:** For standard content containers and cards

**Components:**

- Feed cards (`.post-card`, `.expanded-card`)
- Thumbnails (`.post-thumb-large`)
- Content dividers (`hr`)
- Theme toggle sections

## Implementation Details

### Light Mode

- `--color-border: #d6d5c9` (warm neutral)
- Both tokens resolve to: `1px solid #d6d5c9`

### Dark Mode

- `--color-border: #23232a` (dark neutral)
- Both tokens resolve to: `1px solid #23232a`

## Border Consistency Rules

### ✅ DO

- Use `--frosted-border` for navbar, dropdown, and search overlays
- Use `--border-unified` for content cards, dividers, and form elements
- Always use tokens instead of hardcoded values
- Maintain consistent `1px` thickness across all borders

### ❌ DON'T

- Use hardcoded border values like `1px solid #333` or `border: 1px solid rgba(255,255,255,0.1)`
- Mix different border widths (2px, 3px) unless specifically required for emphasis
- Use different border colors that don't follow the theme system

## Visual Hierarchy

1. **Primary Container Borders:** Frosted glass elements with `--frosted-border`
2. **Content Borders:** Cards and content with `--border-unified`
3. **Interactive State Borders:** Accent color borders for hover/focus states using `--color-accent`

## Migration Complete

The following hardcoded borders have been unified:

- ✅ Navbar: `1px solid rgba(255, 255, 255, 0.08)` → `--frosted-border`
- ✅ Search results: `1px solid var(--color-border)` → `--border-unified`
- ✅ Theme toggle sections: `1px solid var(--color-border)` → `--border-unified`
- ✅ Mobile theme sections: `1px solid rgba(255, 255, 255, 0.1)` → `--border-unified`
- ✅ Thumbnails: `1px solid var(--color-border)` → `--border-unified`
- ✅ HR elements: `1px solid #444` → `--border-unified`

## Testing

To verify the unified border system:

1. **Theme Switching:** Borders should adapt seamlessly between light/dark modes
2. **Responsive Behavior:** Borders should remain consistent across all breakpoints
3. **Component Isolation:** Each component should use the appropriate border token
4. **Visual Consistency:** All elements should appear visually cohesive

## Future Maintenance

When adding new components:

- Determine if it's a frosted glass element → use `--frosted-border`
- For regular content → use `--border-unified`
- Never hardcode border values
- Test in both light and dark themes
