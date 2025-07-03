// Button unification validation script
console.log("🔍 Testing unified button system...");

// Test 1: Check all buttons use the same visual pattern
function testButtonConsistency() {
	const buttonSelectors = [
		".button",
		".pill",
		".feed-cta",
		".card-action-btn",
		".card-play-btn",
		".hero-play-btn",
		".card-cta-banner",
		".hero-game-cta-banner",
		".nav__menu-btn",
	];

	let results = {
		totalButtons: 0,
		consistentButtons: 0,
		issues: [],
	};

	buttonSelectors.forEach((selector) => {
		const elements = document.querySelectorAll(selector);
		elements.forEach((btn, index) => {
			results.totalButtons++;

			const styles = getComputedStyle(btn);
			const defaultBg = styles.backgroundColor;
			const borderColor = styles.borderColor;
			const textColor = styles.color;

			console.log(`${selector}[${index}]:`, {
				background: defaultBg,
				border: borderColor,
				color: textColor,
				isTransparent:
					defaultBg === "rgba(0, 0, 0, 0)" || defaultBg === "transparent",
			});

			// Check if button follows unified pattern
			const isConsistent =
				(defaultBg === "rgba(0, 0, 0, 0)" || defaultBg === "transparent") &&
				borderColor.includes("57, 255, 20"); // accent color

			if (isConsistent) {
				results.consistentButtons++;
			} else {
				results.issues.push(
					`${selector}[${index}]: background=${defaultBg}, border=${borderColor}`
				);
			}
		});
	});

	return results;
}

// Test 2: Check hover states work correctly
function testHoverStates() {
	console.log("🖱️ Testing hover states...");
	const testButton =
		document.querySelector(".pill") || document.querySelector(".button");

	if (!testButton) {
		console.log("❌ No test button found");
		return false;
	}

	// Get default styles
	const defaultStyles = getComputedStyle(testButton);
	console.log("Default:", {
		background: defaultStyles.backgroundColor,
		border: defaultStyles.borderColor,
		color: defaultStyles.color,
	});

	// Simulate hover
	testButton.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

	setTimeout(() => {
		const hoverStyles = getComputedStyle(testButton);
		console.log("Hover:", {
			background: hoverStyles.backgroundColor,
			border: hoverStyles.borderColor,
			color: hoverStyles.color,
			transform: hoverStyles.transform,
		});

		// Reset
		testButton.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

		// Check if hover changed the background
		const hoverWorking =
			hoverStyles.backgroundColor !== defaultStyles.backgroundColor;
		console.log("Hover working:", hoverWorking ? "✅" : "❌");
	}, 100);
}

// Test 3: Check active states
function testActiveStates() {
	console.log("🎯 Testing active states...");
	const activeButtons = document.querySelectorAll(".active");
	console.log(`Found ${activeButtons.length} active buttons`);

	activeButtons.forEach((btn, index) => {
		const styles = getComputedStyle(btn);
		console.log(`Active button ${index}:`, {
			background: styles.backgroundColor,
			border: styles.borderColor,
			color: styles.color,
			hasAccentBg: styles.backgroundColor.includes("57, 255, 20"),
		});
	});
}

// Run all tests
function runUnifiedButtonTests() {
	console.log("\n🧪 Starting Unified Button System Tests...\n");

	const consistencyResults = testButtonConsistency();

	console.log("\n📊 Consistency Results:");
	console.log(`Total buttons: ${consistencyResults.totalButtons}`);
	console.log(`Consistent buttons: ${consistencyResults.consistentButtons}`);
	console.log(
		`Consistency rate: ${Math.round(
			(consistencyResults.consistentButtons / consistencyResults.totalButtons) *
				100
		)}%`
	);

	if (consistencyResults.issues.length > 0) {
		console.log("\n❌ Inconsistencies found:");
		consistencyResults.issues.forEach((issue) => console.log("  -", issue));
	} else {
		console.log("\n✅ All buttons are consistent!");
	}

	// Test hover and active states
	setTimeout(() => {
		testHoverStates();
		testActiveStates();
	}, 500);

	return consistencyResults;
}

// Export for console use
window.runUnifiedButtonTests = runUnifiedButtonTests;

console.log("🚀 Unified Button System Test Loaded!");
console.log("Run runUnifiedButtonTests() in console to start tests");

// Auto-run tests after a short delay
setTimeout(runUnifiedButtonTests, 1000);
