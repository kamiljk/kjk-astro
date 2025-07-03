// Navbar dropdown and search functionality
class NavbarManager {
	constructor() {
		this.overlay = null;
		this.isMenuOpen = false;
		this.isSearchOpen = false;
		this.searchObserver = null;
		this.initializeElements();
		this.setupEventListeners();
		this.initializeSearchPortal();
	}

	initializeElements() {
		this.searchInput = document.querySelector(".pagefind-ui__search-input");
		this.menuButton = document.querySelector("[data-dropdown-trigger]");
		this.searchPortal = document.getElementById("navbar-search-portal");
		this.dropdownPortal = document.getElementById("navbar-dropdown-portal");
	}

	setupEventListeners() {
		// Search input focus/blur
		if (this.searchInput) {
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

	initializeSearchPortal() {
		if (!this.searchPortal) return;

		// Create and observe for search results
		this.searchObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (
						node.nodeType === 1 &&
						node.classList?.contains("pagefind-ui__results")
					) {
						this.moveSearchResultsToPortal(node);
					}
				});
			});
		});

		// Start observing the document for search results
		this.searchObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	moveSearchResultsToPortal(resultsElement) {
		if (this.searchPortal && resultsElement) {
			// Clear existing results
			this.searchPortal.innerHTML = "";
			// Move results to portal
			this.searchPortal.appendChild(resultsElement);
		}
	}

	handleSearchFocus() {
		this.closeMenu();
		this.isSearchOpen = true;
		this.showOverlay();
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
		this.menuButton?.classList.add("open");
		this.dropdownPortal?.setAttribute("data-show", "true");
		this.showOverlay();
	}

	closeMenu() {
		this.isMenuOpen = false;
		this.menuButton?.classList.remove("open");
		this.dropdownPortal?.removeAttribute("data-show");
		if (!this.isSearchOpen) {
			this.hideOverlay();
		}
	}

	closeSearch() {
		this.isSearchOpen = false;
		if (this.searchPortal) {
			this.searchPortal.innerHTML = "";
		}
		if (!this.isMenuOpen) {
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
			this.dropdownPortal?.contains(e.target);

		if (!isSearchRelated && !isMenuRelated) {
			this.closeAllDropdowns();
		}
	}

	showOverlay() {
		if (!this.overlay) {
			this.overlay = document.createElement("div");
			this.overlay.className = "overlay-active";
			document.body.appendChild(this.overlay);
		}
		// Apply theme-appropriate overlay using CSS classes
		const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		this.overlay.dataset.theme = isDark ? "dark" : "light";
	}

	hideOverlay() {
		if (this.overlay) {
			this.overlay.classList.remove("overlay-active");
			setTimeout(() => {
				if (!this.isMenuOpen && !this.isSearchOpen) {
					this.overlay.remove();
					this.overlay = null;
				}
			}, 250);
		}
	}

	destroy() {
		if (this.searchObserver) {
			this.searchObserver.disconnect();
		}
		if (this.overlay) {
			this.overlay.remove();
		}
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
