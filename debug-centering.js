// Debug script to inspect element positioning
async function debugCentering() {
	const header = document.querySelector(".site-header");
	const feed = document.querySelector("#posts-feed");

	console.log("=== HEADER DEBUG ===");
	if (header) {
		const headerRect = header.getBoundingClientRect();
		const headerStyles = window.getComputedStyle(header);
		console.log("Header bounding rect:", headerRect);
		console.log("Header center x:", headerRect.x + headerRect.width / 2);
		console.log("Header position:", headerStyles.position);
		console.log("Header left:", headerStyles.left);
		console.log("Header transform:", headerStyles.transform);
		console.log("Header width:", headerStyles.width);
		console.log("Header max-width:", headerStyles.maxWidth);
		console.log("Header margin-left:", headerStyles.marginLeft);
		console.log("Header margin-right:", headerStyles.marginRight);
		console.log("CSS Variables:");
		console.log(
			"  --content-max-width:",
			headerStyles.getPropertyValue("--content-max-width")
		);
		console.log(
			"  --layout-max-width:",
			headerStyles.getPropertyValue("--layout-max-width")
		);
	}

	console.log("\n=== FEED DEBUG ===");
	if (feed) {
		const feedRect = feed.getBoundingClientRect();
		const feedStyles = window.getComputedStyle(feed);
		console.log("Feed bounding rect:", feedRect);
		console.log("Feed center x:", feedRect.x + feedRect.width / 2);
		console.log("Feed position:", feedStyles.position);
		console.log("Feed left:", feedStyles.left);
		console.log("Feed transform:", feedStyles.transform);
		console.log("Feed width:", feedStyles.width);
		console.log("Feed max-width:", feedStyles.maxWidth);
		console.log("Feed margin-left:", feedStyles.marginLeft);
		console.log("Feed margin-right:", feedStyles.marginRight);
		console.log("CSS Variables:");
		console.log(
			"  --content-max-width:",
			feedStyles.getPropertyValue("--content-max-width")
		);
		console.log(
			"  --layout-max-width:",
			feedStyles.getPropertyValue("--layout-max-width")
		);
	}

	console.log("\n=== VIEWPORT ===");
	console.log("Viewport width:", window.innerWidth);
	console.log("Expected center:", window.innerWidth / 2);
}

// Run on load
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", debugCentering);
} else {
	debugCentering();
}
