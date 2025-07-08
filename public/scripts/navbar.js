class NavbarManager {
	constructor() {
		this.menuButton = document.querySelector("[data-dropdown-trigger]");
		this.dropdownMenu = document.getElementById("filter-sort-menu");
		this.portalOverlay = document.getElementById("navbar-portal-container");
		this.dropdownTarget = document.getElementById("dropdown-container-target");
		this.searchInput = document.querySelector(".pagefind-ui__search-input");

		this.isMenuOpen = false;

		this.init();
	}

	init() {
		this.menuButton.addEventListener("click", (e) => {
			e.stopPropagation();
			this.toggleMenu();
		});

		this.portalOverlay.addEventListener("click", (e) => {
			if (e.target === this.portalOverlay) {
				this.closeMenu();
			}
		});

		this.searchInput.addEventListener("focus", () => this.closeMenu());
	}

	toggleMenu() {
		this.isMenuOpen = !this.isMenuOpen;
		if (this.isMenuOpen) {
			this.openMenu();
		} else {
			this.closeMenu();
		}
	}

	openMenu() {
		this.isMenuOpen = true;
		this.portalOverlay.hidden = false;
		this.dropdownTarget.appendChild(this.dropdownMenu);
		this.dropdownMenu.hidden = false;
		document.body.style.overflow = "hidden";
	}

	closeMenu() {
		if (!this.isMenuOpen) return;
		this.isMenuOpen = false;
		this.portalOverlay.hidden = true;
		this.dropdownMenu.hidden = true;
		document
			.querySelector(".dropdown-container")
			.appendChild(this.dropdownMenu);
		document.body.style.overflow = "";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new NavbarManager();
});
