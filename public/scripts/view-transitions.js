// view-transitions.js
// Adds a simple fade transition between pages using the View Transitions API (if supported)

if (document.startViewTransition) {
	document.addEventListener("click", (e) => {
		const anchor = e.target.closest("a");
		if (
			anchor &&
			anchor.href &&
			anchor.origin === window.location.origin &&
			!anchor.hasAttribute("download") &&
			anchor.target !== "_blank" &&
			!anchor.hash &&
			!anchor.getAttribute("href").startsWith("mailto:") &&
			!anchor.getAttribute("href").startsWith("tel:")
		) {
			e.preventDefault();
			document.startViewTransition(() => {
				window.location = anchor.href;
			});
		}
	});
}
