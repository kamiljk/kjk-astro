console.log("=== DROPDOWN LAYOUT DEBUG ===");

// Function to check dropdown layout
function checkDropdownLayout() {
	const dropdown = document.querySelector('[class*="menu-content"]');
	if (!dropdown) {
		console.log("❌ Dropdown not found");
		return;
	}

	console.log("✅ Dropdown found");
	console.log("Dropdown classes:", dropdown.className);

	const sections = dropdown.querySelectorAll('[class*="menu-section"]');
	console.log(`Found ${sections.length} sections`);

	sections.forEach((section, i) => {
		const label = section.querySelector(
			'[class*="section-label"]'
		)?.textContent;
		const rect = section.getBoundingClientRect();
		console.log(`Section ${i + 1} (${label}):`, {
			width: `${rect.width.toFixed(1)}px`,
			height: `${rect.height.toFixed(1)}px`,
			x: `${rect.x.toFixed(1)}px`,
			y: `${rect.y.toFixed(1)}px`,
			className: section.className,
		});
	});

	// Check computed styles
	const styles = getComputedStyle(dropdown);
	console.log("Dropdown styles:", {
		flexDirection: styles.flexDirection,
		flexWrap: styles.flexWrap,
		justifyContent: styles.justifyContent,
		alignItems: styles.alignItems,
		gap: styles.gap,
		width: styles.width,
		maxWidth: styles.maxWidth,
	});

	// Check if sections are on the same row
	if (sections.length >= 2) {
		const firstY = sections[0].getBoundingClientRect().y;
		const secondY = sections[1].getBoundingClientRect().y;
		const yDiff = Math.abs(firstY - secondY);

		if (yDiff < 10) {
			console.log("✅ Sections appear to be on the same row");
		} else {
			console.log("❌ Sections appear to be stacked vertically");
			console.log(`Y difference: ${yDiff.toFixed(1)}px`);
		}
	}
}

// Function to check color variables
function checkColors() {
	const root = document.documentElement;
	const accent =
		root.style.getPropertyValue("--color-accent") ||
		getComputedStyle(root).getPropertyValue("--color-accent");
	const accentHover =
		root.style.getPropertyValue("--color-accent-hover") ||
		getComputedStyle(root).getPropertyValue("--color-accent-hover");

	console.log("=== COLOR SYSTEM DEBUG ===");
	console.log("Accent color:", accent);
	console.log("Accent hover:", accentHover);

	// Check localStorage
	const savedColor = localStorage.getItem("accent-color");
	const savedRgb = localStorage.getItem("accent-color-rgb");
	console.log("Saved accent color:", savedColor);
	console.log("Saved RGB:", savedRgb);
}

// Wait for dropdown to be rendered
function waitForDropdown() {
	const menuBtn = document.querySelector('[class*="menu-toggle-btn"]');
	if (!menuBtn) {
		console.log("❌ Menu button not found");
		return;
	}

	console.log("✅ Menu button found, clicking to open dropdown...");
	menuBtn.click();

	// Check after a short delay
	setTimeout(() => {
		checkDropdownLayout();
		checkColors();
	}, 300);
}

// Run the checks
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", waitForDropdown);
} else {
	waitForDropdown();
}
