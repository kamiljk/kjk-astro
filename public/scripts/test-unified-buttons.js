/**
 * Test script to verify unified button system
 * Run this in the browser console to test dynamic color changes
 */

// Test 1: Check if the unified accent system is active
function testUnifiedAccentSystem() {
	const root = document.documentElement;
	const accentColor = getComputedStyle(root)
		.getPropertyValue("--color-accent")
		.trim();
	const accentRgb = getComputedStyle(root)
		.getPropertyValue("--color-accent-rgb")
		.trim();

	console.log("🎨 Accent Color System Status:");
	console.log(`--color-accent: ${accentColor}`);
	console.log(`--color-accent-rgb: ${accentRgb}`);

	return accentColor && accentRgb;
}

// Test 2: Check navbar buttons are using unified system
function testNavbarButtons() {
	const menuToggleBtn = document.querySelector(".nav__menu-btn");
	const pills = document.querySelectorAll(".pill");
	const themeToggle = document.querySelector(".theme-toggle-btn");

	console.log("🔘 Navbar Button Elements:");
	console.log(`Menu toggle button: ${menuToggleBtn ? "✅" : "❌"}`);
	console.log(`Pills found: ${pills.length}`);
	console.log(`Theme toggle: ${themeToggle ? "✅" : "❌"}`);

	if (menuToggleBtn) {
		const computedStyle = getComputedStyle(menuToggleBtn);
		console.log(`Menu button background: ${computedStyle.backgroundColor}`);
		console.log(`Menu button border: ${computedStyle.borderColor}`);
	}

	return { menuToggleBtn, pills, themeToggle };
}

// Test 3: Trigger color change and verify updates
function testDynamicColorChange() {
	console.log("🌈 Testing dynamic color change...");

	// Check if setRandomNeonAccent function exists
	if (typeof setRandomNeonAccent === "function") {
		const oldAccent = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-accent")
			.trim();
		console.log(`Current accent: ${oldAccent}`);

		setRandomNeonAccent();

		setTimeout(() => {
			const newAccent = getComputedStyle(document.documentElement)
				.getPropertyValue("--color-accent")
				.trim();
			console.log(`New accent: ${newAccent}`);
			console.log(`Color changed: ${oldAccent !== newAccent ? "✅" : "❌"}`);
		}, 100);
	} else {
		console.log("❌ setRandomNeonAccent function not found");
	}
}

// Test 4: Check HDR support
function testHDRSupport() {
	const hdrSupported = window.matchMedia("(color-gamut: p3)").matches;
	const hdrAttribute = document.body.getAttribute("data-hdr");

	console.log("✨ HDR Support Status:");
	console.log(`Browser P3 support: ${hdrSupported ? "✅" : "❌"}`);
	console.log(`data-hdr attribute: ${hdrAttribute}`);

	return hdrSupported;
}

// Test 5: Check button hover states
function testButtonHoverStates() {
	console.log("🖱️ Testing hover states...");

	const buttons = document.querySelectorAll(
		".nav__menu-btn, .pill, .theme-toggle-btn"
	);
	buttons.forEach((btn, index) => {
		if (btn) {
			console.log(`Button ${index + 1}: ${btn.className}`);

			// Simulate hover
			btn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

			setTimeout(() => {
				const computedStyle = getComputedStyle(btn);
				console.log(`  Hover background: ${computedStyle.backgroundColor}`);
				console.log(`  Hover transform: ${computedStyle.transform}`);

				// Remove hover
				btn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
			}, 50);
		}
	});
}

// Run all tests
function runUnifiedButtonTests() {
	console.log("🧪 Starting Unified Button System Tests...\n");

	const results = {
		accentSystem: testUnifiedAccentSystem(),
		navbarButtons: testNavbarButtons(),
		hdrSupport: testHDRSupport(),
	};

	setTimeout(() => {
		testDynamicColorChange();
		testButtonHoverStates();
	}, 500);

	console.log("\n📊 Test Results Summary:");
	console.log(`Accent system active: ${results.accentSystem ? "✅" : "❌"}`);
	console.log(
		`Navbar buttons found: ${results.navbarButtons.menuToggleBtn ? "✅" : "❌"}`
	);
	console.log(`HDR support detected: ${results.hdrSupport ? "✅" : "❌"}`);

	return results;
}

// Export for console use
window.testUnifiedButtons = runUnifiedButtonTests;

console.log("🚀 Unified Button System Test Suite Loaded!");
console.log("Run testUnifiedButtons() in console to start tests");
