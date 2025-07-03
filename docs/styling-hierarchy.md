# Styling Hierarchy

This document outlines the official styling hierarchy for the project. All
future style-related changes must adhere to these guidelines to ensure
consistency, maintainability, and scalability.

## 1. Global Styles (`src/styles/global.css`)

- **Purpose**: Defines the foundational styles and design tokens for the
  entire application. This is the single source of truth for all design
  decisions.
- **Use For**:
  - **Design Tokens**: CSS Custom Properties (variables) for colors, fonts,
    spacing, radii, shadows, etc. (e.g., `--color-primary`,
    `--font-family-body`, `--spacing-md`).
  - **Base Element Styles**: Un-opinionated base styles for raw HTML
    elements like `body`, `h1`, `p`, and `a`.
  - **Site-wide Layout Rules**: High-level layout rules, such as for the
    main content container.
- **Rules**:
  - Keep selectors simple and low-specificity.
  - **No `!important` declarations.**

## 2. Component-Scoped Styles

This is the preferred method for styling individual components to prevent style
leakage.

- **Astro Components (`.astro`)**: Use the built-in `<style>` tag. Astro
  scopes these styles automatically.
- **UI Framework Components (`.jsx`, `.svelte`, etc.)**: Use CSS Modules
  (`*.module.css`). This generates unique class names, ensuring styles are
  locally scoped.
- **Rules**:
  - Styles should be self-contained and only affect the component itself.
  - **No `!important` declarations.**
  - Consume design tokens from `global.css` using `var()`.

## 3. Utility Classes

- **Purpose**: Small, single-purpose, reusable classes.
- **Examples**: `.sr-only` (for accessibility), `.text-center`, `.hidden`.
- **Implementation**: Can be defined in the global stylesheet.
- **Rules**:
  - Use `!important` *only if absolutely necessary* to guarantee the
    utility's style is applied over other styles (e.g.,
    `display: none !important;` for a `.hidden` class). This is a rare
    exception.

## 4. Third-Party Library Styles

- **Method**: Always follow the library's official documentation for
  customization and theming.
- **Best Practice**: Override the library's provided CSS Custom Properties if
  available.
- **Avoid**: Manually overriding the library's internal class names with
  high-specificity selectors or `!important`. This approach is brittle and
  prone to breaking when the library is updated.
