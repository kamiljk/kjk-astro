/**
 * Runtime Button System Enforcer
 *
 * This script ensures the unified button system styles are applied
 * even when CSS modules try to override them. It runs after page load
 * to inject high-specificity styles that enforce the unified design.
 */

(function () {
	"use strict";

	// Wait for DOM and all stylesheets to load
	function enforceUnifiedButtons() {
		// Create a high-priority style element
		const styleEl = document.createElement("style");
		styleEl.id = "unified-button-enforcer";
		styleEl.setAttribute("data-priority", "highest");

		// Define the unified button styles with maximum specificity
		const unifiedButtonCSS = `
/* UNIFIED BUTTON SYSTEM ENFORCER - MAXIMUM PRIORITY */
/* This CSS is injected at runtime to override any CSS module styles */

.btn,
.button,
.feed-cta,
.pill,
.game-button,
.menu-toggle-btn,
button[class*="pill"],
button[class*="btn"],
button[class*="cta"],
[class*="pill"]:not([class*="container"]):not([class*="wrapper"]),
[class*="button"]:not([class*="container"]):not([class*="wrapper"]),
[class*="feed-cta"] {
  /* Reset any module overrides */
  all: unset !important;
  
  /* Core layout properties */
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  
  /* Typography */
  font-family: var(--font-family-base) !important;
  font-weight: 500 !important;
  font-size: 1rem !important;
  line-height: 1.2 !important;
  text-align: center !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  letter-spacing: 0.02em !important;
  
  /* Sizing */
  min-height: 40px !important;
  min-width: 80px !important;
  padding: 0.5em 1em !important;
  
  /* Visual appearance - DEFAULT STATE: Transparent with accent border */
  background: transparent !important;
  border: 2px solid var(--color-accent) !important;
  border-radius: var(--radius-btn) !important;
  color: var(--color-accent) !important;
  
  /* Effects */
  box-shadow: 0 2px 8px 0 rgba(var(--color-accent-rgb, 57, 255, 20), 0.1) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  
  /* Interaction */
  cursor: pointer !important;
  user-select: none !important;
  touch-action: manipulation !important;
  
  /* Positioning */
  position: relative !important;
  overflow: hidden !important;
  z-index: 1 !important;
}

/* HOVER STATE ENFORCEMENT */
.btn:hover,
.button:hover,
.feed-cta:hover,
.pill:hover,
.game-button:hover,
.menu-toggle-btn:hover,
button[class*="pill"]:hover,
button[class*="btn"]:hover,
button[class*="cta"]:hover,
[class*="pill"]:not([class*="container"]):not([class*="wrapper"]):hover,
[class*="button"]:not([class*="container"]):not([class*="wrapper"]):hover,
[class*="feed-cta"]:hover {
  background: var(--color-accent-hover, var(--color-accent)) !important;
  border-color: var(--color-accent-hover, var(--color-accent)) !important;
  color: var(--color-accent-text, #181c17) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px 0 rgba(var(--color-accent-rgb, 57, 255, 20), 0.25),
              0 2px 4px 0 rgba(var(--color-accent-rgb, 57, 255, 20), 0.1) !important;
}

/* ACTIVE STATE ENFORCEMENT */
.btn:active,
.button:active,
.feed-cta:active,
.pill:active,
.game-button:active,
.menu-toggle-btn:active,
button[class*="pill"]:active,
button[class*="btn"]:active,
button[class*="cta"]:active,
[class*="pill"]:not([class*="container"]):not([class*="wrapper"]):active,
[class*="button"]:not([class*="container"]):not([class*="wrapper"]):active,
[class*="feed-cta"]:active {
  background: var(--color-accent-active, var(--color-accent)) !important;
  border-color: var(--color-accent-active, var(--color-accent)) !important;
  color: var(--color-accent-text, #181c17) !important;
  transform: translateY(0px) scale(0.98) !important;
  box-shadow: 0 1px 4px 0 rgba(var(--color-accent-rgb, 57, 255, 20), 0.2) !important;
}

/* FOCUS STATE ENFORCEMENT */
.btn:focus,
.btn:focus-visible,
.button:focus,
.button:focus-visible,
.feed-cta:focus,
.feed-cta:focus-visible,
.pill:focus,
.pill:focus-visible,
.game-button:focus,
.game-button:focus-visible,
.menu-toggle-btn:focus,
.menu-toggle-btn:focus-visible,
button[class*="pill"]:focus,
button[class*="pill"]:focus-visible,
button[class*="btn"]:focus,
button[class*="btn"]:focus-visible,
button[class*="cta"]:focus,
button[class*="cta"]:focus-visible,
[class*="pill"]:not([class*="container"]):not([class*="wrapper"]):focus,
[class*="pill"]:not([class*="container"]):not([class*="wrapper"]):focus-visible,
[class*="button"]:not([class*="container"]):not([class*="wrapper"]):focus,
[class*="button"]:not([class*="container"]):not([class*="wrapper"]):focus-visible,
[class*="feed-cta"]:focus,
[class*="feed-cta"]:focus-visible {
  background: var(--color-accent-hover, var(--color-accent)) !important;
  border-color: var(--color-accent-hover, var(--color-accent)) !important;
  color: var(--color-accent-text, #181c17) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px 0 rgba(var(--color-accent-rgb, 57, 255, 20), 0.25),
              0 2px 4px 0 rgba(var(--color-accent-rgb, 57, 255, 20), 0.1),
              0 0 0 3px rgba(var(--color-accent-rgb, 57, 255, 20), 0.3) !important;
  outline: none !important;
}
`;

		styleEl.textContent = unifiedButtonCSS;

		// Append to head to ensure it loads after CSS modules
		document.head.appendChild(styleEl);

		console.log("✅ Unified Button System Enforcer: Applied runtime overrides");
	}

	// Run when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", enforceUnifiedButtons);
	} else {
		enforceUnifiedButtons();
	}

	// Also run after a short delay to catch any late-loading CSS modules
	setTimeout(enforceUnifiedButtons, 500);
})();
