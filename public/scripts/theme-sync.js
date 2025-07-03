/**
 * Theme synchronization helper for embedded games and components
 * This script helps embedded content match the main site theme
 */

// Define default values that match site CSS variables
const defaultLightTheme = {
	bgColor: "#F5F0E1",
	textColor: "#000000",
	primaryColor: "#FF1493",
	secondaryBgColor: "#FFFFFF",
	descColor: "#333333",
	cardBorderColor: "#DDDDDD",
};

const defaultDarkTheme = {
	bgColor: "#000000",
	textColor: "#F5F5DC",
	primaryColor: "#FFD700",
	secondaryBgColor: "#121212",
	descColor: "#AAAAAA",
	cardBorderColor: "#333333",
};

/**
 * Get current theme colors from CSS variables
 * @returns {Object} Theme color object
 */
function getThemeColors() {
	const styles = getComputedStyle(document.documentElement);
	const theme = document.body.dataset.theme || "light";
	const isDarkMode = theme === "dark";

	return {
		bgColor:
			styles.getPropertyValue("--bg-color").trim() ||
			(isDarkMode ? defaultDarkTheme.bgColor : defaultLightTheme.bgColor),
		textColor:
			styles.getPropertyValue("--text-color").trim() ||
			(isDarkMode ? defaultDarkTheme.textColor : defaultLightTheme.textColor),
		primaryColor:
			styles.getPropertyValue("--color-accent").trim() ||
			(isDarkMode
				? defaultDarkTheme.primaryColor
				: defaultLightTheme.primaryColor),
		secondaryBgColor:
			styles.getPropertyValue("--secondary-bg").trim() ||
			(isDarkMode
				? defaultDarkTheme.secondaryBgColor
				: defaultLightTheme.secondaryBgColor),
		descColor:
			styles.getPropertyValue("--desc-color").trim() ||
			(isDarkMode ? defaultDarkTheme.descColor : defaultLightTheme.descColor),
		cardBorderColor:
			styles.getPropertyValue("--card-border").trim() ||
			(isDarkMode
				? defaultDarkTheme.cardBorderColor
				: defaultLightTheme.cardBorderColor),
		theme, // Current theme name
		isDarkMode, // Boolean for convenience
	};
}

/**
 * Set theme colors on embedded content
 * @param {Object} targetWindow - Window object to apply theme to (use window.frames[index] for iframes)
 */
function applyThemeToWindow(targetWindow) {
	if (!targetWindow || !targetWindow.document) return;

	const colors = getThemeColors();
	const targetDoc = targetWindow.document;

	// Apply theme via CSS variables to target document
	const root = targetDoc.documentElement || targetDoc.querySelector(":root");
	if (root) {
		root.style.setProperty("--bg-color", colors.bgColor);
		root.style.setProperty("--text-color", colors.textColor);
		root.style.setProperty("--color-accent", colors.primaryColor);
		root.style.setProperty("--primary-color", colors.primaryColor); // Legacy compatibility
		root.style.setProperty("--secondary-bg", colors.secondaryBgColor);
		root.style.setProperty("--desc-color", colors.descColor);
		root.style.setProperty("--card-border", colors.cardBorderColor);
	}

	// Set data-theme attribute on body
	if (targetDoc.body) {
		targetDoc.body.dataset.theme = colors.theme;
	}

	// Trigger custom event that game-specific code can listen for
	try {
		targetWindow.dispatchEvent(
			new CustomEvent("themeChange", { detail: colors })
		);
	} catch (err) {
		console.warn("Could not dispatch theme event to embedded content:", err);
	}
}

/**
 * Apply theme to all iframes in the document
 */
function applyThemeToAllIframes() {
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe, index) => {
		try {
			if (iframe.contentWindow) {
				applyThemeToWindow(iframe.contentWindow);
			}
		} catch (err) {
			console.warn(`Could not apply theme to iframe ${index}:`, err);
		}
	});
}

// Listen for theme changes in the parent document
window.addEventListener("themeColorChange", () => {
	applyThemeToAllIframes();
});

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
	// Initial sync
	applyThemeToAllIframes();

	// Watch for iframe loads and apply theme
	document.querySelectorAll("iframe").forEach((iframe) => {
		iframe.addEventListener("load", () => {
			applyThemeToWindow(iframe.contentWindow);
		});
	});
});

// Export functions for use in other scripts
export { getThemeColors, applyThemeToWindow, applyThemeToAllIframes };
