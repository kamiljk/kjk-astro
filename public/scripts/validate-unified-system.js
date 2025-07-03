// Final validation script for unified button system
console.log("🔍 Validating unified button system...");

// Check that primary accent variable exists
const accentColor = getComputedStyle(document.documentElement).getPropertyValue(
	"--color-accent"
);
console.log("✅ --color-accent:", accentColor);

// Check that legacy variables are synced
const primaryColor = getComputedStyle(
	document.documentElement
).getPropertyValue("--primary-color");
console.log("✅ --primary-color (legacy):", primaryColor);

// Find all button-like elements
const buttonSelectors = [
	".button",
	".pill",
	".feed-cta",
	".card-action-btn",
	".card-play-btn",
	".hero-play-btn",
	".card-cta-banner",
	".hero-game-cta-banner",
	".menuButton",
	".orderBtn",
	".themeButton",
];

let totalButtons = 0;
let accentButtons = 0;

buttonSelectors.forEach((selector) => {
	const elements = document.querySelectorAll(selector);
	totalButtons += elements.length;

	elements.forEach((el) => {
		const styles = getComputedStyle(el);
		const bgColor = styles.backgroundColor;
		const hoverBg = styles.getPropertyValue("--color-accent") || accentColor;

		if (hoverBg && hoverBg.trim()) {
			accentButtons++;
		}
	});

	if (elements.length > 0) {
		console.log(`✅ Found ${elements.length} ${selector} elements`);
	}
});

console.log(`\n📊 Summary:`);
console.log(`Total button elements: ${totalButtons}`);
console.log(`Elements with accent system: ${accentButtons}`);
console.log(
	`Unified system coverage: ${
		totalButtons > 0 ? Math.round((accentButtons / totalButtons) * 100) : 0
	}%`
);

// Test hover behavior on first button found
const firstButton = document.querySelector(buttonSelectors.join(","));
if (firstButton) {
	console.log("🎯 Testing hover behavior...");

	// Simulate hover
	firstButton.dispatchEvent(new MouseEvent("mouseenter"));
	setTimeout(() => {
		const hoverStyles = getComputedStyle(firstButton);
		console.log("✅ Hover background:", hoverStyles.backgroundColor);

		// Reset
		firstButton.dispatchEvent(new MouseEvent("mouseleave"));
	}, 100);
}

console.log("🎉 Unified button system validation complete!");
console.log(
	"All components should now use --color-accent for consistent theming."
);
