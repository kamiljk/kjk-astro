// Enhanced backdrop filter debugging
function debugBackdropFilter() {
	console.log("=== BACKDROP FILTER DEBUG ===");

	// Check browser support
	const supportsBackdrop = CSS.supports("backdrop-filter", "blur(1px)");
	const supportsWebkitBackdrop = CSS.supports(
		"-webkit-backdrop-filter",
		"blur(1px)"
	);
	console.log("Browser Support:", { supportsBackdrop, supportsWebkitBackdrop });

	// Check CSS variables
	const computedStyle = getComputedStyle(document.documentElement);
	const frostedBlur = computedStyle.getPropertyValue("--frosted-blur").trim();
	const frostedBg = computedStyle.getPropertyValue("--frosted-bg").trim();
	console.log("CSS Variables:", { frostedBlur, frostedBg });

	// Check for pagefind elements
	const searchContainer = document.querySelector(".search-results-container");
	const pagefindDrawer = document.querySelector(".pagefind-ui__drawer");

	console.log("Elements found:", {
		searchContainer: !!searchContainer,
		pagefindDrawer: !!pagefindDrawer,
	});

	if (pagefindDrawer) {
		const drawerStyle = getComputedStyle(pagefindDrawer);
		console.log("Pagefind Drawer Computed Styles:", {
			backdropFilter: drawerStyle.backdropFilter,
			webkitBackdropFilter: drawerStyle.webkitBackdropFilter,
			background: drawerStyle.background,
			backgroundColor: drawerStyle.backgroundColor,
			position: drawerStyle.position,
			zIndex: drawerStyle.zIndex,
			isolation: drawerStyle.isolation,
			contain: drawerStyle.contain,
		});

		// Check what's behind the element
		const rect = pagefindDrawer.getBoundingClientRect();
		console.log("Drawer position:", rect);

		// Test if there's content behind it
		const behindElement = document.elementFromPoint(
			rect.left + rect.width / 2,
			rect.top - 10
		);
		console.log("Element behind drawer:", behindElement);

		// Force apply styles directly
		console.log("Forcing backdrop filter...");
		pagefindDrawer.style.setProperty(
			"backdrop-filter",
			"blur(18px) saturate(180%)",
			"important"
		);
		pagefindDrawer.style.setProperty(
			"-webkit-backdrop-filter",
			"blur(18px) saturate(180%)",
			"important"
		);
		pagefindDrawer.style.setProperty(
			"background",
			"rgba(255, 255, 255, 0.69)",
			"important"
		);

		// Create a test element with backdrop filter
		const testDiv = document.createElement("div");
		testDiv.style.cssText = `
            position: fixed;
            top: 150px;
            left: 20px;
            width: 200px;
            height: 100px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid #ccc;
            border-radius: 10px;
            z-index: 10000;
            padding: 10px;
            color: black;
            font-size: 12px;
        `;
		testDiv.textContent = "Test backdrop filter element";
		document.body.appendChild(testDiv);

		const testStyle = getComputedStyle(testDiv);
		console.log("Test element backdrop filter:", testStyle.backdropFilter);

		setTimeout(() => {
			document.body.removeChild(testDiv);
		}, 5000);
	}

	// Check for any overriding CSS rules
	const allStylesheets = Array.from(document.styleSheets);
	console.log("Checking stylesheets for backdrop-filter rules...");

	allStylesheets.forEach((sheet, index) => {
		try {
			const rules = Array.from(sheet.cssRules || sheet.rules || []);
			rules.forEach((rule) => {
				if (rule.style && rule.style.backdropFilter) {
					console.log(`Stylesheet ${index}, rule: ${rule.selectorText}`, {
						backdropFilter: rule.style.backdropFilter,
						specificity: rule.selectorText,
					});
				}
			});
		} catch (e) {
			console.log(`Cannot access stylesheet ${index}:`, e.message);
		}
	});
}

// Run debug when search is opened
function setupSearchDebug() {
	const searchInput = document.querySelector(
		'.search-results-container input[type="search"]'
	);
	if (searchInput) {
		searchInput.addEventListener("focus", () => {
			setTimeout(debugBackdropFilter, 500);
		});

		searchInput.addEventListener("input", () => {
			if (searchInput.value.length > 0) {
				setTimeout(debugBackdropFilter, 1000);
			}
		});
	}
}

// Auto-setup when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupSearchDebug);
} else {
	setupSearchDebug();
}

// Also run immediately if Pagefind is already loaded
setTimeout(debugBackdropFilter, 2000);
