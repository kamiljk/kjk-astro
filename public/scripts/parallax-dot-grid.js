// Parallax effect for dot grid background
window.addEventListener("scroll", () => {
	const grid = document.querySelector(".parallax-dot-grid-bg");
	if (grid) {
		const y = window.scrollY * 0.4;
		grid.style.backgroundPosition = `0px ${y}px`;
	}
});
