// BROWSER DEBUG SCRIPT - Copy and paste this into browser console at http://localhost:4323

console.log("=== CENTERING DEBUG ===");

const header = document.querySelector(".site-header");
const feed = document.querySelector("#posts-feed");
const main = document.querySelector(".main-alignment-wrapper");

console.log("\n=== VIEWPORT ===");
console.log("Viewport width:", window.innerWidth);
console.log("Expected center:", window.innerWidth / 2);

if (header) {
	console.log("\n=== HEADER DEBUG ===");
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
}

if (main) {
	console.log("\n=== MAIN WRAPPER DEBUG ===");
	const mainRect = main.getBoundingClientRect();
	const mainStyles = window.getComputedStyle(main);
	console.log("Main bounding rect:", mainRect);
	console.log("Main center x:", mainRect.x + mainRect.width / 2);
	console.log("Main position:", mainStyles.position);
	console.log("Main width:", mainStyles.width);
	console.log("Main max-width:", mainStyles.maxWidth);
	console.log("Main margin-left:", mainStyles.marginLeft);
	console.log("Main margin-right:", mainStyles.marginRight);
	console.log("CSS Variables:");
	console.log(
		"  --content-max-width:",
		mainStyles.getPropertyValue("--content-max-width")
	);
}

if (feed) {
	console.log("\n=== FEED DEBUG ===");
	const feedRect = feed.getBoundingClientRect();
	const feedStyles = window.getComputedStyle(feed);
	console.log("Feed bounding rect:", feedRect);
	console.log("Feed center x:", feedRect.x + feedRect.width / 2);
	console.log("Feed position:", feedStyles.position);
	console.log("Feed width:", feedStyles.width);
	console.log("Feed max-width:", feedStyles.maxWidth);
	console.log("Feed margin-left:", feedStyles.marginLeft);
	console.log("Feed margin-right:", feedStyles.marginRight);
	console.log("CSS Variables:");
	console.log(
		"  --content-max-width:",
		feedStyles.getPropertyValue("--content-max-width")
	);
}

// Check if there are any CSS cascade issues
console.log("\n=== CHECKING CSS CASCADE ===");
const rootStyles = window.getComputedStyle(document.documentElement);
console.log(
	"Root --content-max-width:",
	rootStyles.getPropertyValue("--content-max-width")
);
console.log(
	"Root --site-max-width:",
	rootStyles.getPropertyValue("--site-max-width")
);
