/**
 * Card Navigation System v2
 * Handles opening content in hero card for posts/about pages,
 * and displays game info (description + play link) for game cards.
 */

document.addEventListener("DOMContentLoaded", () => {
	initCardNavigation();
});

function initCardNavigation() {
	// --- Close Hero Card Function ---
	function closeHeroCard() {
		const heroCard = document.getElementById("hero-card");
		if (!heroCard || !heroCard.classList.contains("active")) return;

		heroCard.classList.remove("active");
		document.body.style.overflow = ""; // Restore scrolling
		document.body.classList.remove("hero-modal-open"); // Restore all content

		// Reset content after transition for smoother closing
		setTimeout(() => {
			if (heroCard.classList.contains("active")) return; // Don't clear if reopened quickly

			const heroIframe = heroCard.querySelector(".hero-iframe");
			const heroMarkdownContainer = heroCard.querySelector(".hero-markdown");
			const heroTitleEl = heroCard.querySelector(".hero-title");
			const heroContentArea = heroCard.querySelector(".hero-card-content");

			if (heroIframe) heroIframe.src = "about:blank";
			if (heroMarkdownContainer) {
				// Reset to loading state for next open
				heroMarkdownContainer.innerHTML =
					'<div class="loading-indicator" style="display: none;"><div class="loading-spinner"></div><p>Loading...</p></div>';
				heroMarkdownContainer.classList.remove(
					"has-post-content",
					"has-game-info"
				);
				heroMarkdownContainer.style.display = "block"; // Ensure it's visible for next load
			}
			if (heroTitleEl) heroTitleEl.textContent = "";
			if (heroContentArea) heroContentArea.classList.remove("has-iframe"); // Ensure iframe class is removed
		}, 300); // Match CSS transition duration
	}
	window.closeHeroCard = closeHeroCard; // Make globally accessible

	// --- Activate Hero Card Function ---
	// isGameInfo: true if we are just showing game description, not loading game in iframe
	window.activateHeroCard = (title, contentHTML = null, isGameInfo = false) => {
		const heroCard = document.getElementById("hero-card");
		if (!heroCard) return false;

		const heroTitleEl = heroCard.querySelector(".hero-title");
		const heroMarkdownContainer = heroCard.querySelector(".hero-markdown");
		const heroContentArea = heroCard.querySelector(".hero-card-content");
		const heroIframe = heroCard.querySelector(".hero-iframe");
		const loadingIndicator =
			heroMarkdownContainer?.querySelector(".loading-indicator");

		// Set title
		if (heroTitleEl) heroTitleEl.textContent = title || "";

		// Hide iframe and ensure markdown container is visible by default
		if (heroIframe) {
			heroIframe.style.display = "none";
			heroIframe.src = "about:blank"; // Prevent accidental loading
		}
		if (heroContentArea) heroContentArea.classList.remove("has-iframe");
		if (heroMarkdownContainer) heroMarkdownContainer.style.display = "block";

		// Handle content display
		if (contentHTML) {
			// We have content to display (fetched post or game info)
			if (loadingIndicator) loadingIndicator.style.display = "none"; // Hide loader
			if (heroMarkdownContainer) {
				heroMarkdownContainer.innerHTML = contentHTML; // Inject the content
				heroMarkdownContainer.classList.add(
					isGameInfo ? "has-game-info" : "has-post-content"
				);
				heroMarkdownContainer.classList.remove(
					isGameInfo ? "has-post-content" : "has-game-info"
				);
			}
		} else {
			// No content yet, show loading state (called initially)
			if (loadingIndicator) loadingIndicator.style.display = "flex"; // Show loader
			if (heroMarkdownContainer) {
				// Clear previous content except loader
				heroMarkdownContainer.innerHTML =
					'<div class="loading-indicator" style="display: flex;"><div class="loading-spinner"></div><p>Loading...</p></div>';
				heroMarkdownContainer.classList.remove(
					"has-post-content",
					"has-game-info"
				);
			}
		}

		// Activate the card visually
		if (!heroCard.classList.contains("active")) {
			heroCard.classList.add("active");
			document.body.style.overflow = "hidden"; // Prevent background scroll
			document.body.classList.add("hero-modal-open"); // Hide all except hero card
		}

		return true;
	};

	// --- Event Listener for "Learn More" Buttons ---
	document.body.addEventListener("click", async (e) => {
		const learnButton = e.target.closest(".card-learn-btn, .primary-cta"); // Updated to match both old and new classes
		if (!learnButton) return; // Exit if click wasn't on a learn button

		e.preventDefault(); // Prevent default action (link navigation or button submit)

		const title = learnButton.getAttribute("data-title");
		const slug = learnButton.getAttribute("data-slug");
		const isGame = learnButton.getAttribute("data-is-game") === "true";

		if (!title || !slug || typeof window.activateHeroCard !== "function") {
			return;
		}

		// Activate hero card with title (shows loading state)
		window.activateHeroCard(title);

		if (isGame) {
			// --- Handle Game Card "Learn More" ---
			const description = learnButton.getAttribute("data-description");
			const gamePlayLink = learnButton.getAttribute("data-game-play-link");

			// Construct HTML for game info display in hero card
			const gameInfoHtml = `
        <div class="game-info-content">
          <h4>About ${title}</h4>
          <p>${description || "No description available."}</p>
          ${
						gamePlayLink
							? `<a href="${gamePlayLink}" target="_blank" rel="noopener noreferrer" class="card-action-btn card-play-btn hero-play-btn">Play Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 3 14 9-14 9V3z" /></svg></a>`
							: ""
					}
        </div>
      `;

			// Update hero card with game info (no fetching needed)
			// Use a small delay to allow loading indicator to show briefly
			setTimeout(() => {
				window.activateHeroCard(title, gameInfoHtml, true); // true indicates it's game info
			}, 50);
		} else {
			// --- Handle Non-Game Card "Learn More" (Fetch Content) ---
			const fetchUrl =
				learnButton.getAttribute("data-link") ||
				learnButton.getAttribute("href");
			if (!fetchUrl) {
				window.activateHeroCard(
					title,
					'<p class="error-message">Error: Could not find content link.</p>',
					false
				);
				return;
			}

			try {
				const response = await fetch(fetchUrl);
				if (!response.ok)
					throw new Error(`Failed to load content (${response.status})`);
				const html = await response.text();

				const parser = new DOMParser();
				const doc = parser.parseFromString(html, "text/html");
				// Prioritize '.post-content', then 'article', then 'main'
				const contentElement =
					doc.querySelector(".post-content") ||
					doc.querySelector("article") ||
					doc.querySelector("main");
				let content = contentElement?.innerHTML || "Could not extract content.";

				// Optional: Remove h1 if it exists within the fetched content to avoid duplicate titles
				const tempDiv = document.createElement("div");
				tempDiv.innerHTML = content;
				const h1 = tempDiv.querySelector("h1");
				if (
					h1 &&
					h1.textContent.trim().toLowerCase() === title.trim().toLowerCase()
				) {
					h1.remove();
					content = tempDiv.innerHTML;
				}

				// Update hero card with fetched content
				window.activateHeroCard(title, content, false);
			} catch (error) {
				console.error("Error loading content:", error);
				const errorHtml = `
          <div class="error-message">
            <h3>Failed to load content</h3>
            <p>${error.message}. Please try again or <a href="${fetchUrl}" target="_blank" rel="noopener noreferrer">open directly</a>.</p>
          </div>
        `;
				window.activateHeroCard(title, errorHtml, false);
			}
		}
	});

	// --- Setup Close Handlers ---
	setupCloseHandlers();
}

function setupCloseHandlers() {
	const heroCard = document.getElementById("hero-card");
	if (!heroCard) return;

	const heroCloseBtn = heroCard.querySelector("#hero-close-btn");
	const heroBackLink = heroCard.querySelector("#hero-back-link");

	if (heroCloseBtn) {
		heroCloseBtn.addEventListener("click", window.closeHeroCard);
	}
	if (heroBackLink) {
		heroBackLink.addEventListener("click", (e) => {
			e.preventDefault();
			window.closeHeroCard();
		});
	}

	// Close on Escape key
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && heroCard.classList.contains("active")) {
			window.closeHeroCard();
		}
	});

	// Close when clicking the backdrop (the .hero-card element itself)
	heroCard.addEventListener("click", (e) => {
		if (e.target === heroCard) {
			// Only close if the click is directly on the backdrop
			window.closeHeroCard();
		}
	});
}

// Ensure initialization runs even if DOMContentLoaded already fired
if (document.readyState !== "loading") {
	initCardNavigation();
}
