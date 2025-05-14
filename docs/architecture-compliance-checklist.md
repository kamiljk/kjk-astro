# Astro Architecture Compliance Checklist

For every code change, review and check off each item below. Reference the relevant section in `docs/siteArchitecture.md` for details.

## 1. Component Structure
- [ ] Is this UI static or interactive? (Static → Astro component / Interactive → React Island)
- [ ] Is the component in the correct directory (`common`, `features`, `islands`)?

## 2. Client Directives
- [ ] When should this component hydrate? (Above fold → `client:load` / Secondary → `client:idle` / Below fold → `client:visible`)
- [ ] Is the correct client directive used?

## 3. Data Flow
- [ ] Does data move between components as shown in the data flow diagram (Section II.B)?
- [ ] Are URL params, API calls, and state handled as specified?

## 4. Styling
- [ ] Are all design tokens/variables used (no hardcoded values)?
- [ ] Are styles in the correct place (global.css, CSS Modules, or Astro `<style>`) per Section V.B?

## 5. Responsive Behavior
- [ ] Does the component/layout behave correctly at all breakpoints (Section V.D)?
- [ ] Are media queries and layout rules compliant?

## 6. Performance
- [ ] Will this impact load time? (If so, is it justified and tested?)
- [ ] Are performance targets (Section VI.B) met or not regressed?

## 7. Documentation
- [ ] Are code comments updated to reference relevant architecture sections?
- [ ] Is the component guide updated if needed?

---

**Before merging, ensure all boxes are checked and reference any relevant section of `siteArchitecture.md` in your PR or commit message.**
