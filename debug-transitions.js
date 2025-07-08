import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("http://localhost:4322/test-button-states.html");

	const button = page.locator(".pill").first();

	// Check if there are any active transitions or animations
	const transitionInfo = await button.evaluate((el) => {
		const computed = getComputedStyle(el);
		return {
			transition: computed.transition,
			animation: computed.animation,
			willChange: computed.willChange,
		};
	});

	console.log("Transition/Animation info:", transitionInfo);

	// Check for event listeners
	const hasListeners = await button.evaluate((el) => {
		// Try to get event listeners (this might not work in all browsers)
		return {
			hasOnMouseEnter: !!el.onmouseenter,
			hasOnMouseLeave: !!el.onmouseleave,
			hasOnMouseOver: !!el.onmouseover,
			classList: Array.from(el.classList),
			tagName: el.tagName,
		};
	});

	console.log("Event listener info:", hasListeners);

	// Try to disable transitions and test again
	await button.evaluate((el) => {
		el.style.transition = "none";
		el.style.setProperty("background", "#ff0000", "important");
	});

	const noTransitionTest = await button.evaluate((el) => {
		return getComputedStyle(el).background;
	});

	console.log("No transition test:", noTransitionTest);

	await browser.close();
})();
