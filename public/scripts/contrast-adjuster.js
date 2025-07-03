/**
 * Contrast Adjuster
 *
 * Automatically sets text color to black or white based on background color
 * to ensure optimal readability regardless of generated theme colors.
 */

document.addEventListener("DOMContentLoaded", () => {
	// Run initial adjustment
	adjustTextContrast();

	// Set up observer to handle dynamic theme changes
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (
				mutation.attributeName === "data-theme" ||
				mutation.attributeName === "style" ||
				mutation.type === "childList"
			) {
				adjustTextContrast();
				break;
			}
		}
	});

	// Observe theme changes on html and body elements
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme", "class"],
	});

	observer.observe(document.body, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
});

/**
 * Calculate the relative luminance of an RGB color
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 *
 * @param {number} r Red channel (0-255)
 * @param {number} g Green channel (0-255)
 * @param {number} b Blue channel (0-255)
 * @return {number} Luminance value between 0 and 1
 */
function getRelativeLuminance(r, g, b) {
	// Convert RGB values to sRGB
	const sR = r / 255;
	const sG = g / 255;
	const sB = b / 255;

	// Calculate RGB values
	const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
	const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
	const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

	// Calculate luminance
	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Parse hex, rgb, or rgba color to RGB values
 *
 * @param {string} color CSS color string
 * @return {object|null} Object with r, g, b values or null if parsing fails
 */
function parseColor(color) {
	if (!color) return null;

	// Handle hex colors
	if (color.startsWith("#")) {
		color = color.replace("#", "");

		// Handle short hex format (#RGB)
		if (color.length === 3) {
			const r = parseInt(color[0] + color[0], 16);
			const g = parseInt(color[1] + color[1], 16);
			const b = parseInt(color[2] + color[2], 16);
			return { r, g, b };
		}

		// Handle standard hex format (#RRGGBB)
		if (color.length === 6) {
			const r = parseInt(color.substring(0, 2), 16);
			const g = parseInt(color.substring(2, 4), 16);
			const b = parseInt(color.substring(4, 6), 16);
			return { r, g, b };
		}

		return null;
	}

	// Handle rgb and rgba colors
	if (color.startsWith("rgb")) {
		const values = color.match(/\d+/g);
		if (!values || values.length < 3) return null;

		return {
			r: parseInt(values[0], 10),
			g: parseInt(values[1], 10),
			b: parseInt(values[2], 10),
		};
	}

	return null;
}

/**
 * Determine if white or black text would be more readable on the given background color
 *
 * @param {string} bgColor Background color in any valid CSS format
 * @return {string} 'black' or 'white' based on which provides better contrast
 */
function getContrastColor(bgColor) {
	const rgb = parseColor(bgColor);
	if (!rgb) return "black"; // Default to black if parsing fails

	const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

	// Use white text for dark backgrounds, black text for light backgrounds
	// 0.5 is a good threshold, but 0.4-0.6 is also reasonable depending on preference
	return luminance > 0.55 ? "black" : "white";
}

/**
 * Adjust text color for better contrast on all elements with theme colors
 */
function adjustTextContrast() {
	// Get theme color from CSS variable (unified accent color system)
	const primaryColor = getComputedStyle(document.documentElement)
		.getPropertyValue("--color-accent")
		.trim();

	// Calculate the best contrast color
	const textColor = getContrastColor(primaryColor);

	// Apply to CTA banners
	document.querySelectorAll(".card-cta-banner").forEach((banner) => {
		banner.style.color = textColor;

		// Adjust child SVG elements
		banner.querySelectorAll("svg").forEach((svg) => {
			svg.style.stroke = textColor;
		});
	});

	// Apply to category and featured badges
	document.querySelectorAll(".card-category").forEach((badge) => {
		badge.style.color = textColor;
	});

	// Adjust explore buttons - need special handling when hovered
	document.querySelectorAll(".card-explore-btn").forEach((button) => {
		// Default state uses primary color text
		button.addEventListener("mouseenter", () => {
			button.style.color = textColor;
		});

		button.addEventListener("mouseleave", () => {
			button.style.color = ""; // Reset to CSS variable
		});
	});

	// Apply to active nav items
	document.querySelectorAll(".nav-item.active").forEach((item) => {
		item.style.color = textColor;
	});

	// Store contrast color as a CSS variable for other components to use
	document.documentElement.style.setProperty("--contrast-color", textColor);
}
