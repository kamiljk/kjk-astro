// Script to inspect the actual HTML structure and classes
setTimeout(() => {
	console.log("=== INSPECTING ACTUAL HTML ===");

	const dropdown = document.querySelector("#filter-sort-menu");
	if (!dropdown) {
		console.log("❌ No dropdown found");
		return;
	}

	console.log("✅ Dropdown HTML:");
	console.log(dropdown.outerHTML);

	const buttons = dropdown.querySelectorAll("button");
	console.log(`\n=== ${buttons.length} BUTTONS FOUND ===`);

	buttons.forEach((btn, i) => {
		console.log(`\nButton ${i + 1}: "${btn.textContent.trim()}"`);
		console.log("Class:", btn.className);
		console.log(
			"CSS Module classes:",
			Array.from(btn.classList).filter((c) => c.includes("_"))
		);
		console.log(
			"Computed background:",
			window.getComputedStyle(btn).backgroundColor
		);
		console.log("Parent container:", btn.parentElement.className);
	});

	// Test CSS selector
	const testButtons = document.querySelectorAll("#filter-sort-menu button");
	console.log(`\n=== CSS SELECTOR TEST ===`);
	console.log(`#filter-sort-menu button found: ${testButtons.length}`);

	const testPills = document.querySelectorAll(
		'#filter-sort-menu [class*="pill"]'
	);
	console.log(`[class*="pill"] found: ${testPills.length}`);

	const testArrows = document.querySelectorAll(
		'#filter-sort-menu [class*="sort-arrow"]'
	);
	console.log(`[class*="sort-arrow"] found: ${testArrows.length}`);
}, 2000);
