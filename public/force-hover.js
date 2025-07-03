// Force hover styles via JavaScript as a test
document.addEventListener("DOMContentLoaded", function () {
	console.log("DOM loaded, adding hover handlers...");

	setTimeout(() => {
		const dropdown = document.querySelector("#filter-sort-menu");
		if (!dropdown) {
			console.log("No dropdown found");
			return;
		}

		// Find all buttons except theme toggle
		const buttons = dropdown.querySelectorAll(
			'button:not([class*="theme-toggle"])'
		);
		console.log(`Found ${buttons.length} buttons to fix`);

		buttons.forEach((button, index) => {
			console.log(`Button ${index}: ${button.textContent.trim()}`);

			// Force hover styles with JavaScript
			button.addEventListener("mouseenter", function () {
				console.log(`Hover on: ${this.textContent.trim()}`);
				this.style.background = "#39ff14 !important";
				this.style.color = "#111 !important";
				this.style.transform = "translateY(-1px)";
				this.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
			});

			button.addEventListener("mouseleave", function () {
				console.log(`Leave: ${this.textContent.trim()}`);
				this.style.background = "#222";
				this.style.color = "#fff";
				this.style.transform = "none";
				this.style.boxShadow = "var(--shadow-elevation-2)";
			});
		});
	}, 1000);
});
