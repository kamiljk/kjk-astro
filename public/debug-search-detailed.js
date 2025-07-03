// Search width debug - run in browser console
setTimeout(() => {
	console.log("=== SEARCH WIDTH DEBUG ===");

	// Get all relevant elements
	const logo = document.querySelector(".nav__logo");
	const searchContainer = document.querySelector(".search-container-inline");
	const searchBar = document.querySelector(".search-bar-inline");
	const searchResults = document.querySelector(".search-results-container");
	const navbarMenu = document.querySelector(".navbar-menu-wrapper");
	const navbarRow = document.querySelector(".navbar-header-row");

	function logElement(element, name) {
		if (!element) {
			console.log(`${name}: NOT FOUND`);
			return;
		}

		const rect = element.getBoundingClientRect();
		const computed = window.getComputedStyle(element);

		console.log(`\n--- ${name} ---`);
		console.log("Actual width:", rect.width + "px");
		console.log("Computed width:", computed.width);
		console.log("Flex:", computed.flex);
		console.log("Max-width:", computed.maxWidth);
		console.log("Min-width:", computed.minWidth);
		console.log("Position left:", rect.left + "px");
		console.log("Position right:", rect.right + "px");
	}

	logElement(logo, "Logo");
	logElement(searchContainer, "Search Container");
	logElement(searchBar, "Search Bar");
	logElement(searchResults, "Search Results");
	logElement(navbarMenu, "Navbar Menu");
	logElement(navbarRow, "Navbar Row");

	// Calculate available space
	if (logo && navbarMenu && navbarRow) {
		const logoRect = logo.getBoundingClientRect();
		const menuRect = navbarMenu.getBoundingClientRect();
		const rowRect = navbarRow.getBoundingClientRect();

		const availableSpace = menuRect.left - logoRect.right;
		const searchActualWidth = searchResults
			? searchResults.getBoundingClientRect().width
			: 0;

		console.log("\n--- SPACE ANALYSIS ---");
		console.log("Logo right edge:", logoRect.right + "px");
		console.log("Menu left edge:", menuRect.left + "px");
		console.log("Available space for search:", availableSpace + "px");
		console.log("Search actual width:", searchActualWidth + "px");
		console.log(
			"Search is using",
			((searchActualWidth / availableSpace) * 100).toFixed(1) +
				"% of available space"
		);

		if (searchActualWidth < availableSpace * 0.8) {
			console.log("⚠️ ISSUE: Search bar is NOT filling available space!");
		} else {
			console.log("✅ Search bar is properly filling available space");
		}
	}
}, 2000);
