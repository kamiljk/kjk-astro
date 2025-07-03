/**
 * Unified Button System Validation Script
 * Tests that all buttons are properly using the unified styling system
 */

function validateUnifiedButtonSystem() {
	console.log("🔍 Validating Unified Button System...");

	// Test 1: Check if unified CSS is loaded
	const unifiedSystemLoaded = Array.from(document.styleSheets).some((sheet) => {
		try {
			return sheet.href && sheet.href.includes("unified-button-system.css");
		} catch (e) {
			return false;
		}
	});

	console.log("✅ Unified CSS loaded:", unifiedSystemLoaded);

	// Test 2: Check HDR neon variables are set
	const root = document.documentElement;
	const accentColor = getComputedStyle(root).getPropertyValue("--color-accent");
	const accentHover = getComputedStyle(root).getPropertyValue(
		"--color-accent-hover"
	);
	const accentText = getComputedStyle(root).getPropertyValue(
		"--color-accent-text"
	);

	console.log("🌈 HDR Variables:");
	console.log("  --color-accent:", accentColor);
	console.log("  --color-accent-hover:", accentHover);
	console.log("  --color-accent-text:", accentText);

	// Test 3: Find all buttons and check their styling
	const buttonSelectors = [
		".btn",
		".button",
		".pill",
		".feed-cta",
		".game-button",
		".card-action-btn",
		".hero-play-btn",
		".menu-toggle-btn",
		".dropdown-item",
		".theme-toggle-btn",
	];

	let totalButtons = 0;
	let styledButtons = 0;

	buttonSelectors.forEach((selector) => {
		const buttons = document.querySelectorAll(selector);
		totalButtons += buttons.length;

		buttons.forEach((btn) => {
			const styles = getComputedStyle(btn);
			const borderColor = styles.borderColor;
			const transition = styles.transition;

			// Check if button has unified styling
			if (borderColor.includes("rgb") && transition.includes("0.2s")) {
				styledButtons++;
			}

			console.log(`${selector}: ${buttons.length} found`);
		});
	});

	console.log(`🎯 Styled buttons: ${styledButtons}/${totalButtons}`);

	// Test 4: Check for override prevention
	const moduleButtons = document.querySelectorAll(
		'[class*="_"] button, [class*="module"] button'
	);
	console.log("🛡️ Module-scoped buttons found:", moduleButtons.length);

	// Test 5: Test hover states
	if (totalButtons > 0) {
		const testButton = document.querySelector(".btn, .button, .pill");
		if (testButton) {
			testButton.addEventListener("mouseenter", () => {
				const hoverStyles = getComputedStyle(testButton);
				console.log("🖱️ Hover transform:", hoverStyles.transform);
			});
		}
	}

	// Generate test report
	const report = {
		unifiedSystemLoaded,
		hdrVariablesSet: !!(accentColor && accentHover && accentText),
		totalButtons,
		styledButtons,
		coveragePercentage: totalButtons
			? ((styledButtons / totalButtons) * 100).toFixed(1)
			: 0,
		moduleButtonsFound: moduleButtons.length,
	};

	console.log("📊 Final Report:", report);

	if (report.coveragePercentage >= 95) {
		console.log("✅ PASS: Unified button system is working correctly!");
	} else {
		console.log("⚠️ WARN: Some buttons may not be using the unified system");
	}

	return report;
}

// Auto-run validation when page loads
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", validateUnifiedButtonSystem);
} else {
	validateUnifiedButtonSystem();
}

// Make function available globally for manual testing
window.validateUnifiedButtonSystem = validateUnifiedButtonSystem;
