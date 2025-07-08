// Navbar dropdown and search functionality
class NavbarManager {
	constructor() {
		console.log("[NavbarManager] Initializing...");
		this.overlay = null;
		this.isMenuOpen = false;
		this.isSearchOpen = false;
		this.searchResults = [];
		this.searchDebounceTimer = null;
		this.initializeElements();
		this.setupEventListeners();
		this.initializePagefind();
		console.log("[NavbarManager] Initialization complete");
	}

	initializeElements() {
		this.searchInput = document.querySelector(".pagefind-ui__search-input");
		this.menuButton = document.querySelector("[data-dropdown-trigger]");
		this.dropdownMenu = document.getElementById("filter-sort-menu");
		this.searchPortal = document.getElementById("navbar-search-portal");
		this.dropdownPortal = document.getElementById("navbar-dropdown-portal");

		console.log("[NavbarManager] Initialized elements:", {
			menuButton: !!this.menuButton,
			dropdownMenu: !!this.dropdownMenu,
			searchInput: !!this.searchInput,
			searchPortal: !!this.searchPortal,
			dropdownPortal: !!this.dropdownPortal,
		});
	}

	async initializePagefind() {
		// Load Pagefind if not already loaded
		if (!window.Pagefind) {
			try {
				const script = document.createElement("script");
				script.type = "module";
				script.src = "/pagefind/pagefind.js";
				script.onload = () => {
					console.log("[NavbarManager] Pagefind loaded successfully");
				};
				script.onerror = () => {
					console.error("[NavbarManager] Failed to load Pagefind script");
				};
				document.head.appendChild(script);
			} catch (error) {
				console.error("[NavbarManager] Error loading Pagefind:", error);
			}
		}
	}

	setupEventListeners() {
		// Search input events
		if (this.searchInput) {
			this.searchInput.addEventListener("input", (e) =>
				this.handleSearchInput(e)
			);
			this.searchInput.addEventListener("focus", () =>
				this.handleSearchFocus()
			);
			this.searchInput.addEventListener("blur", (e) =>
				this.handleSearchBlur(e)
			);
		}

		// Menu button toggle
		if (this.menuButton) {
			this.menuButton.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.toggleMenu();
			});
		}

		// Close dropdowns when clicking outside
		document.addEventListener("click", (e) => this.handleOutsideClick(e));

		// Close dropdowns on escape key
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				this.closeAllDropdowns();
			}
		});
	}

	async handleSearchInput(e) {
		const query = e.target.value.trim();
		console.log(`[NavbarManager] Search input: "${query}"`);

		// Clear previous debounce timer
		if (this.searchDebounceTimer) {
			clearTimeout(this.searchDebounceTimer);
		}

		// For testing - show portal immediately with any input
		if (query.length > 0) {
			console.log("[NavbarManager] Showing test search results");
			this.searchPortal.innerHTML = `
				<div class="search-results-container">
					<div class="search-results-header">Testing search for "${query}"</div>
					<div class="search-results-list">
						<div class="search-result-item">
							<div class="search-result-title">Test Result</div>
							<div class="search-result-excerpt">This is a test result to verify the search UI is working.</div>
						</div>
					</div>
				</div>
			`;
			this.showSearch();
			return;
		}

		// Debounce search to avoid too many requests
		this.searchDebounceTimer = setTimeout(async () => {
			if (query.length === 0) {
				this.closeSearch();
				return;
			}

			if (query.length < 2) {
				return; // Don't search for single characters
			}

			await this.performSearch(query);
		}, 300);
	}

	async performSearch(query) {
		if (!window.Pagefind) {
			console.warn("[NavbarManager] Pagefind not loaded yet");
			return;
		}

		try {
			console.log(`[NavbarManager] Searching for: "${query}"`);
			const results = await window.Pagefind.search(query);

			this.searchResults = results.results || [];
			this.renderSearchResults(query);

			if (this.searchResults.length > 0) {
				this.showSearch();
			} else {
				this.showSearch(); // Still show "No results" message
			}
		} catch (error) {
			console.error("[NavbarManager] Search error:", error);
		}
	}

	renderSearchResults(query) {
		if (!this.searchPortal) return;

		if (this.searchResults.length === 0) {
			this.searchPortal.innerHTML = `
				<div class="search-results-container">
					<div class="search-message">No results found for "${query}"</div>
				</div>
			`;
			return;
		}

		const resultsHtml = this.searchResults
			.map((result) => {
				const title = result.meta?.title || "Untitled";
				const excerpt = result.meta?.excerpt || "";
				const url = result.url || "#";

				return `
				<a href="${url}" class="search-result-item">
					<div class="search-result-title">${title}</div>
					${excerpt ? `<div class="search-result-excerpt">${excerpt}</div>` : ""}
				</a>
			`;
			})
			.join("");

		this.searchPortal.innerHTML = `
			<div class="search-results-container">
				<div class="search-results-header">
					${this.searchResults.length} result${
			this.searchResults.length !== 1 ? "s" : ""
		} for "${query}"
				</div>
				<div class="search-results-list">
					${resultsHtml}
				</div>
			</div>
		`;
	}

	handleSearchFocus() {
		console.log("[NavbarManager] Search focused");
		if (this.searchInput.value.trim().length > 0) {
			this.showSearch();
		}
		this.closeMenu();
	}

	handleSearchBlur(e) {
		// Delay to allow clicks on search results
		setTimeout(() => {
			if (!this.searchPortal?.contains(document.activeElement)) {
				this.closeSearch();
			}
		}, 150);
	}

	showSearch() {
		this.isSearchOpen = true;
		this.showOverlay();
		if (this.searchPortal) {
			this.searchPortal.setAttribute("data-show", "true");
		}
	}

	closeSearch() {
		this.isSearchOpen = false;
		if (this.searchPortal) {
			this.searchPortal.removeAttribute("data-show");
			this.searchPortal.innerHTML = "";
		}
		if (!this.isMenuOpen) {
			this.hideOverlay();
		}
	}

	handleSearchBlur(e) {
		// Delay to allow clicks on search results
		setTimeout(() => {
			if (
				!this.searchPortal?.contains(document.activeElement) &&
				!this.searchInput?.contains(document.activeElement)
			) {
				this.closeSearch();
			}
		}, 150);
	}

	toggleMenu() {
		if (this.isMenuOpen) {
			this.closeMenu();
		} else {
			this.openMenu();
		}
	}

	openMenu() {
		this.closeSearch();
		this.isMenuOpen = true;
		this.menuButton?.setAttribute("aria-expanded", "true");
		this.dropdownMenu?.removeAttribute("hidden");
		this.dropdownMenu?.setAttribute("aria-hidden", "false");
		this.dropdownPortal?.setAttribute("data-show", "true");
		this.showOverlay();
	}

	closeMenu() {
		this.isMenuOpen = false;
		this.menuButton?.setAttribute("aria-expanded", "false");
		this.dropdownMenu?.setAttribute("hidden", "");
		this.dropdownMenu?.setAttribute("aria-hidden", "true");
		this.dropdownPortal?.removeAttribute("data-show");
		if (!this.isSearchOpen) {
			this.hideOverlay();
		}
	}

	closeAllDropdowns() {
		this.closeMenu();
		this.closeSearch();
		if (this.searchInput) {
			this.searchInput.blur();
		}
	}

	handleOutsideClick(e) {
		const isSearchRelated =
			this.searchInput?.contains(e.target) ||
			this.searchPortal?.contains(e.target);
		const isMenuRelated =
			this.menuButton?.contains(e.target) ||
			this.dropdownMenu?.contains(e.target) ||
			this.dropdownPortal?.contains(e.target);

		if (!isSearchRelated && !isMenuRelated) {
			this.closeAllDropdowns();
		}
	}

	showOverlay() {
		if (!this.overlay) {
			this.overlay = document.createElement("div");
			this.overlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100vw;
				height: 100vh;
				z-index: 99998;
				pointer-events: auto;
				transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
			`;
			document.body.appendChild(this.overlay);
		}

		// Apply theme-appropriate overlay
		const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		this.overlay.style.backgroundColor = isDark
			? "rgba(0, 0, 0, 0.8)"
			: "rgba(0, 0, 0, 0.6)";
		this.overlay.classList.add("overlay-active");
	}

	hideOverlay() {
		if (this.overlay) {
			this.overlay.classList.remove("overlay-active");
			this.overlay.style.backgroundColor = "transparent";
		}
	}

	destroy() {
		// Clean up event listeners and observers
		if (this.searchDebounceTimer) {
			clearTimeout(this.searchDebounceTimer);
		}

		if (this.overlay) {
			this.overlay.remove();
		}

		// Remove event listeners
		document.removeEventListener("click", this.handleOutsideClick);
		document.removeEventListener("keydown", this.handleEscape);
	}
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		window.navbarManager = new NavbarManager();
	});
} else {
	window.navbarManager = new NavbarManager();
}

export default NavbarManager;
