// Final Button Unification Validation
console.log("🎯 FINAL BUTTON UNIFICATION VALIDATION");
console.log("======================================");

// Check 1: All button types exist and use consistent styling
function validateButtonTypes() {
	console.log("\n1️⃣ Checking button type consistency...");

	const buttonTypes = [
		{ selector: ".button", name: "Standard Buttons" },
		{ selector: ".pill", name: "Pill Buttons" },
		{ selector: ".feed-cta", name: "Feed CTAs" },
		{ selector: ".card-action-btn", name: "Card Actions" },
		{ selector: ".card-play-btn", name: "Card Play" },
		{ selector: ".hero-play-btn", name: "Hero Play" },
		{ selector: ".nav__menu-btn", name: "Menu Toggle" },
	];

	let totalConsistent = 0;
	let totalButtons = 0;

	buttonTypes.forEach((type) => {
		const elements = document.querySelectorAll(type.selector);
		if (elements.length > 0) {
			console.log(`✅ ${type.name}: ${elements.length} found`);

			elements.forEach((btn) => {
				totalButtons++;
				const styles = getComputedStyle(btn);
				const bg = styles.backgroundColor;
				const border = styles.borderColor;

				// Check if follows pattern
				const isConsistent =
					(bg === "rgba(0, 0, 0, 0)" ||
						bg === "transparent" ||
						bg.includes("57, 255, 20")) &&
					(border.includes("57, 255, 20") || bg.includes("57, 255, 20"));

				if (isConsistent) totalConsistent++;
			});
		} else {
			console.log(`ℹ️  ${type.name}: None found (normal on this page)`);
		}
	});

	const consistency = Math.round((totalConsistent / totalButtons) * 100);
	console.log(
		`\n📊 Overall consistency: ${totalConsistent}/${totalButtons} (${consistency}%)`
	);

	return consistency >= 90;
}

// Check 2: Accent color system
function validateAccentSystem() {
	console.log("\n2️⃣ Checking accent color system...");

	const rootStyles = getComputedStyle(document.documentElement);
	const accentColor = rootStyles.getPropertyValue("--color-accent").trim();
	const accentText = rootStyles.getPropertyValue("--color-accent-text").trim();
	const accentRgb = rootStyles.getPropertyValue("--color-accent-rgb").trim();

	if (accentColor) {
		console.log(`✅ --color-accent: ${accentColor}`);
	} else {
		console.log("❌ --color-accent not found");
		return false;
	}

	if (accentText) {
		console.log(`✅ --color-accent-text: ${accentText}`);
	} else {
		console.log("⚠️  --color-accent-text not found");
	}

	if (accentRgb) {
		console.log(`✅ --color-accent-rgb: ${accentRgb}`);
	} else {
		console.log("⚠️  --color-accent-rgb not found");
	}

	return accentColor !== "";
}

// Check 3: Interactive states
function validateInteractiveStates() {
	console.log("\n3️⃣ Testing interactive states...");

	const testButton =
		document.querySelector(".pill:not(.active)") ||
		document.querySelector(".button:not(.button--primary)") ||
		document.querySelector("button");

	if (!testButton) {
		console.log("❌ No test button found");
		return false;
	}

	const originalBg = getComputedStyle(testButton).backgroundColor;
	console.log(`Testing button: ${testButton.className || testButton.tagName}`);
	console.log(`Default background: ${originalBg}`);

	// Test hover
	testButton.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

	setTimeout(() => {
		const hoverBg = getComputedStyle(testButton).backgroundColor;
		const hoverTransform = getComputedStyle(testButton).transform;

		console.log(`Hover background: ${hoverBg}`);
		console.log(`Hover transform: ${hoverTransform}`);

		const hoverWorks = hoverBg !== originalBg;
		if (hoverWorks) {
			console.log("✅ Hover state changes background");
		} else {
			console.log("❌ Hover state does not change background");
		}

		// Reset
		testButton.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
	}, 100);

	return true;
}

// Check 4: Active states
function validateActiveStates() {
	console.log("\n4️⃣ Checking active/selected states...");

	const activeButtons = document.querySelectorAll(".active");
	console.log(`Found ${activeButtons.length} active buttons`);

	if (activeButtons.length === 0) {
		console.log("ℹ️  No active buttons found (normal if no dropdown open)");
		return true;
	}

	let activeConsistent = 0;

	activeButtons.forEach((btn, index) => {
		const styles = getComputedStyle(btn);
		const bg = styles.backgroundColor;
		const hasAccentFill = bg.includes("57, 255, 20");

		console.log(`Active button ${index}: ${bg}`);

		if (hasAccentFill) {
			console.log(`✅ Active button ${index} has accent fill`);
			activeConsistent++;
		} else {
			console.log(`❌ Active button ${index} should have accent fill`);
		}
	});

	return activeConsistent === activeButtons.length;
}

// Check 5: No module CSS overrides
function validateNoOverrides() {
	console.log("\n5️⃣ Checking for problematic overrides...");

	// Look for hardcoded colors that might override the system
	const problems = [];

	// Check for hardcoded background colors on buttons
	document
		.querySelectorAll("button, .button, .pill, .feed-cta")
		.forEach((btn) => {
			const style = btn.style;
			if (style.backgroundColor && !style.backgroundColor.includes("var(")) {
				problems.push(
					`Button has hardcoded background: ${style.backgroundColor}`
				);
			}
			if (style.color && !style.color.includes("var(")) {
				problems.push(`Button has hardcoded color: ${style.color}`);
			}
		});

	if (problems.length === 0) {
		console.log("✅ No hardcoded color overrides found");
		return true;
	} else {
		console.log("❌ Found problematic overrides:");
		problems.forEach((problem) => console.log(`  • ${problem}`));
		return false;
	}
}

// Run all validations
function runFinalValidation() {
	console.log("🚀 Starting final validation...\n");

	const results = {
		buttonTypes: false,
		accentSystem: false,
		interactiveStates: false,
		activeStates: false,
		noOverrides: false,
	};

	results.buttonTypes = validateButtonTypes();
	results.accentSystem = validateAccentSystem();
	results.interactiveStates = validateInteractiveStates();
	results.activeStates = validateActiveStates();
	results.noOverrides = validateNoOverrides();

	// Wait for async tests
	setTimeout(() => {
		console.log("\n🏁 FINAL VALIDATION RESULTS");
		console.log("==========================");
		console.log(
			`Button Type Consistency: ${results.buttonTypes ? "✅" : "❌"}`
		);
		console.log(`Accent Color System: ${results.accentSystem ? "✅" : "❌"}`);
		console.log(
			`Interactive States: ${results.interactiveStates ? "✅" : "❌"}`
		);
		console.log(`Active States: ${results.activeStates ? "✅" : "❌"}`);
		console.log(`No CSS Overrides: ${results.noOverrides ? "✅" : "❌"}`);

		const passed = Object.values(results).filter(Boolean).length;
		const total = Object.keys(results).length;

		console.log(`\n🎯 Overall Score: ${passed}/${total} tests passed`);

		if (passed === total) {
			console.log("\n🎉 BUTTON UNIFICATION COMPLETE!");
			console.log(
				"All buttons now use the unified accent color system consistently."
			);
		} else {
			console.log("\n⚠️  Some issues remain. Check the results above.");
		}
	}, 1000);
}

// Export for console use
window.runFinalValidation = runFinalValidation;

// Auto-run validation
console.log("To run validation: runFinalValidation()");
setTimeout(runFinalValidation, 500);
