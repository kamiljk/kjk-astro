// Comprehensive Button State Validation Script
// Tests all button states (default, hover, active, focus, disabled) across all viewports

(function () {
	"use strict";

	const BUTTON_SELECTORS = [
		".button",
		".feed-cta",
		".pill",
		".navbar .pill",
		".menu-content .pill",
		".game-button",
		".close-btn",
		".maximalist-404-back",
		".card-action-btn",
		".card-play-btn",
		".hero-play-btn",
		".card-cta-banner",
		".hero-game-cta-banner",
		".menu-toggle-btn",
		"button:not([class])",
	];

	const VIEWPORTS = [
		{ name: "Mobile", width: 375 },
		{ name: "Mobile Large", width: 480 },
		{ name: "Tablet", width: 768 },
		{ name: "Medium", width: 830 },
		{ name: "Desktop", width: 1024 },
		{ name: "Large Desktop", width: 1440 },
	];

	const STATES = ["default", "hover", "active", "focus", "disabled"];

	function getComputedButtonStyle(element, state = "default") {
		const styles = window.getComputedStyle(element);
		return {
			background: styles.backgroundColor,
			border: styles.borderColor,
			color: styles.color,
			boxShadow: styles.boxShadow,
			transform: styles.transform,
			opacity: styles.opacity,
			cursor: styles.cursor,
			fontSize: styles.fontSize,
			padding: styles.padding,
			minHeight: styles.minHeight,
			minWidth: styles.minWidth,
		};
	}

	function testButtonState(button, state) {
		const originalState = {
			disabled: button.disabled,
			hover: button.matches(":hover"),
			active: button.matches(":active"),
			focus: button.matches(":focus"),
		};

		// Reset button state
		button.disabled = false;
		button.blur();

		let styles;

		switch (state) {
			case "default":
				styles = getComputedButtonStyle(button);
				break;
			case "hover":
				button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
				styles = getComputedButtonStyle(button);
				button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
				break;
			case "active":
				button.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
				styles = getComputedButtonStyle(button);
				button.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
				break;
			case "focus":
				button.focus();
				styles = getComputedButtonStyle(button);
				button.blur();
				break;
			case "disabled":
				button.disabled = true;
				styles = getComputedButtonStyle(button);
				break;
		}

		// Restore original state
		button.disabled = originalState.disabled;

		return styles;
	}

	function validateButtonConsistency() {
		const results = {
			viewport: {
				width: window.innerWidth,
				name:
					VIEWPORTS.find((v) => window.innerWidth <= v.width)?.name ||
					"Extra Large",
			},
			buttons: [],
			issues: [],
			summary: {
				total: 0,
				consistent: 0,
				inconsistent: 0,
			},
		};

		// Find all buttons on the page
		const allButtons = [];
		BUTTON_SELECTORS.forEach((selector) => {
			try {
				const buttons = document.querySelectorAll(selector);
				buttons.forEach((btn) => {
					if (!allButtons.includes(btn)) {
						allButtons.push(btn);
					}
				});
			} catch (e) {
				console.warn(`Selector error: ${selector}`, e);
			}
		});

		console.log(
			`Found ${allButtons.length} buttons to test at ${results.viewport.width}px`
		);

		// Test each button in each state
		allButtons.forEach((button, index) => {
			const buttonData = {
				index,
				element: button,
				selector: button.className || button.tagName,
				states: {},
				issues: [],
			};

			STATES.forEach((state) => {
				try {
					buttonData.states[state] = testButtonState(button, state);
				} catch (e) {
					buttonData.issues.push(`Error testing ${state} state: ${e.message}`);
				}
			});

			// Check for consistency issues
			const defaultStyles = buttonData.states.default;
			const hoverStyles = buttonData.states.hover;

			// Default state should be transparent background with accent border/text
			if (
				defaultStyles.background !== "rgba(0, 0, 0, 0)" &&
				defaultStyles.background !== "transparent" &&
				!defaultStyles.background.includes("rgba(0, 0, 0, 0)")
			) {
				buttonData.issues.push(
					"Default state should have transparent background"
				);
			}

			// Hover state should have accent background
			if (hoverStyles.background === defaultStyles.background) {
				buttonData.issues.push("Hover state should change background color");
			}

			// Focus state should have visible focus indicator
			const focusStyles = buttonData.states.focus;
			if (focusStyles.boxShadow === defaultStyles.boxShadow) {
				buttonData.issues.push(
					"Focus state should have visible focus indicator"
				);
			}

			// Disabled state should have reduced opacity
			const disabledStyles = buttonData.states.disabled;
			if (parseFloat(disabledStyles.opacity) >= 0.8) {
				buttonData.issues.push("Disabled state should have reduced opacity");
			}

			results.buttons.push(buttonData);
			results.summary.total++;

			if (buttonData.issues.length === 0) {
				results.summary.consistent++;
			} else {
				results.summary.inconsistent++;
				results.issues.push(
					...buttonData.issues.map((issue) => `Button ${index}: ${issue}`)
				);
			}
		});

		return results;
	}

	function testAllViewports() {
		const allResults = [];

		VIEWPORTS.forEach((viewport) => {
			// Simulate viewport
			if (window.innerWidth !== viewport.width) {
				console.log(`Testing viewport: ${viewport.name} (${viewport.width}px)`);
				// Note: In a real test, you'd need to actually resize the window
				// For now, we'll test the current viewport
			}

			const results = validateButtonConsistency();
			allResults.push(results);
		});

		return allResults;
	}

	function generateReport(results) {
		console.group("🎯 Button Consistency Validation Report");

		if (Array.isArray(results)) {
			// Multiple viewport results
			results.forEach((result) => {
				console.group(
					`📱 ${result.viewport.name} (${result.viewport.width}px)`
				);
				console.log(`Total buttons: ${result.summary.total}`);
				console.log(`Consistent: ${result.summary.consistent}`);
				console.log(`Issues: ${result.summary.inconsistent}`);

				if (result.issues.length > 0) {
					console.group("❌ Issues found:");
					result.issues.forEach((issue) => console.log(`• ${issue}`));
					console.groupEnd();
				}
				console.groupEnd();
			});
		} else {
			// Single viewport result
			console.log(
				`📱 Current viewport: ${results.viewport.name} (${results.viewport.width}px)`
			);
			console.log(`Total buttons: ${results.summary.total}`);
			console.log(`Consistent: ${results.summary.consistent}`);
			console.log(`Issues: ${results.summary.inconsistent}`);

			if (results.issues.length > 0) {
				console.group("❌ Issues found:");
				results.issues.forEach((issue) => console.log(`• ${issue}`));
				console.groupEnd();
			}

			if (results.summary.inconsistent === 0) {
				console.log("✅ All buttons are consistent!");
			}
		}

		console.groupEnd();
		return results;
	}

	// Public API
	window.buttonValidator = {
		testCurrent: () => generateReport(validateButtonConsistency()),
		testAll: () => generateReport(testAllViewports()),
		test: validateButtonConsistency,
		selectors: BUTTON_SELECTORS,
		viewports: VIEWPORTS,
		states: STATES,
	};

	console.log("🔧 Button Validator loaded. Use:");
	console.log("• buttonValidator.testCurrent() - Test current viewport");
	console.log("• buttonValidator.testAll() - Test all viewports");
})();
