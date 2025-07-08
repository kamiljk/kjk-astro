import React, { useEffect, useRef, useState } from "react";

export default function PagefindSearch() {
	const containerRef = useRef(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");

	useEffect(() => {
		let timeoutId = null;

		function initPagefindUI() {
			if (window.PagefindUI && containerRef.current) {
				try {
					// Initialize Pagefind UI
					new window.PagefindUI({
						element: containerRef.current,
						rootUrl: "/pagefind/",
						showImages: false,
						showSubResults: true,
					});

					// Register search management with global navbar state
					if (typeof window !== "undefined") {
						if (!window.navbarState) {
							window.navbarState = {
								searchOpen: false,
								menuOpen: false,
								closeSearch: null,
								closeMenu: null
							};
						}
						window.navbarState.closeSearch = () => setIsSearchOpen(false);
						window.navbarState.searchOpen = isSearchOpen;
					}

					// Simplified timeout to add essential CSS overrides
					timeoutId = setTimeout(() => {
						const existingStyle = document.getElementById('pagefind-override-styles');
						if (!existingStyle) {
							const globalStyle = document.createElement('style');
							globalStyle.id = 'pagefind-override-styles';
							globalStyle.textContent = `
								/* === MINIMAL SEARCH RESULTS STYLING === */
								
								/* Search form - transparent background with visible underline */
								.search-results-container .pagefind-ui__form {
									width: 100% !important;
									flex: 1 1 auto !important;
									background: transparent !important;
									border: none !important;
									border-bottom: 1px solid var(--color-border) !important;
									border-radius: 0 !important;
									box-shadow: none !important;
									height: 40px !important;
									display: flex !important;
									align-items: center !important;
									position: relative !important;
									transition: border-bottom-color 0.2s ease !important;
								}
								
								.search-results-container .pagefind-ui__form:focus-within {
									border-bottom-color: var(--color-accent) !important;
								}
								
								/* Search input styling */
								.search-results-container .pagefind-ui__search-input {
									width: 100% !important;
									flex: 1 1 auto !important;
									background: transparent !important;
									border: none !important;
									outline: none !important;
									padding: 10px 30px 10px 25px !important;
									height: 40px !important;
									color: var(--color-text) !important;
									font-size: 14px !important;
									font-family: inherit !important;
									box-sizing: border-box !important;
								}
								
								.search-results-container .pagefind-ui__search-input::placeholder {
									color: var(--color-desc) !important;
									opacity: 0.5 !important;
								}
								
								/* Search icon */
								.search-results-container .pagefind-ui__form::before {
									content: "⌕";
									position: absolute;
									left: 8px;
									top: 50%;
									transform: translateY(-50%);
									font-size: 16px;
									opacity: 0.5;
									pointer-events: none;
									color: var(--color-text);
									z-index: 1;
								}
								
								/* === SEARCH RESULTS DROPDOWN - SIMPLIFIED === */
								
								/* Main results container - frosted glass effect */
								.search-results-container .pagefind-ui__drawer {
									position: fixed !important;
									top: var(--navbar-height, 76px) !important;
									left: 50% !important;
									transform: translateX(-50%) !important;
									width: 90vw !important;
									max-width: var(--navbar-max-width, 1200px) !important;
									z-index: 99999 !important;
									
									/* FROSTED GLASS - direct values to test */
									background: rgba(255, 255, 255, 0.8) !important;
									backdrop-filter: blur(20px) saturate(180%) !important;
									-webkit-backdrop-filter: blur(20px) saturate(180%) !important;
									border: 1px solid rgba(255, 255, 255, 0.3) !important;
									box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12) !important;
									border-radius: 0 0 12px 12px !important;
									border-top: none !important;
									
									/* Animation */
									opacity: 0 !important;
									transform: translateX(-50%) translateY(-10px) !important;
									transition: opacity 0.25s ease, transform 0.25s ease !important;
									pointer-events: none !important;
									visibility: hidden !important;
									
									max-height: 400px !important;
									overflow-y: auto !important;
									padding: 0 !important;
								}
								
								/* Show results when search is active */
								.search-results-container .pagefind-ui__drawer:not(.pagefind-ui__hidden) {
									opacity: 1 !important;
									transform: translateX(-50%) translateY(0) !important;
									pointer-events: auto !important;
									visibility: visible !important;
								}
								
								/* Results content area */
								.search-results-container .pagefind-ui__results {
									display: flex !important;
									flex-direction: column !important;
									gap: var(--fluid-space-s) !important;
									width: 100% !important;
									padding: 20px !important;
									margin: 0 !important;
									box-sizing: border-box !important;
									background: transparent !important;
								}
								
								/* Individual search result styling */
								.search-results-container .pagefind-ui__result {
									padding: 12px !important;
									border-radius: 8px !important;
									transition: background-color 0.2s ease !important;
									background: transparent !important;
									border: none !important;
									margin: 0 !important;
								}
								
								.search-results-container .pagefind-ui__result:hover {
									background: rgba(255, 255, 255, 0.2) !important;
								}
								
								/* Result link styling */
								.search-results-container .pagefind-ui__result-link {
									color: var(--color-text) !important;
									text-decoration: none !important;
									display: block !important;
								}
								
								.search-results-container .pagefind-ui__result-link:hover {
									color: var(--color-accent) !important;
								}
								
								/* Result title styling */
								.search-results-container .pagefind-ui__result-title {
									font-weight: 600 !important;
									margin-bottom: 4px !important;
									color: var(--color-text) !important;
								}
								
								/* Result excerpt styling */
								.search-results-container .pagefind-ui__result-excerpt {
									color: var(--color-desc) !important;
									font-size: 0.9em !important;
									line-height: 1.4 !important;
								}
								
								/* Dark mode adjustments */
								@media (prefers-color-scheme: dark) {
									.search-results-container .pagefind-ui__drawer {
										background: rgba(26, 26, 26, 0.9) !important;
										border: 1px solid rgba(255, 255, 255, 0.1) !important;
										box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
									}
									
									.search-results-container .pagefind-ui__result:hover {
										background: rgba(255, 255, 255, 0.1) !important;
									}
								}
								
								/* Clear button - simplified */
								.search-results-container .pagefind-ui__search-clear {
									position: absolute !important;
									right: 8px !important;
									top: 50% !important;
									transform: translateY(-50%) !important;
									width: 24px !important;
									height: 24px !important;
									background: none !important;
									border: none !important;
									cursor: pointer !important;
									opacity: 0.6 !important;
									font-size: 14px !important;
									color: var(--color-desc) !important;
								}
								
								.search-results-container .pagefind-ui__search-clear:hover {
									opacity: 1 !important;
								}
							`;
							document.head.appendChild(globalStyle);
						}

						// Calculate and set navbar height for proper positioning
						const setNavbarHeight = () => {
							const navbar = document.querySelector('nav') || document.querySelector('[data-navbar]') || document.querySelector('.navbar');
							if (navbar) {
								const navbarHeight = navbar.getBoundingClientRect().height;
								document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
							}
						};
						
						// Set initial navbar height
						setNavbarHeight();
						
						// Update navbar height on resize
						window.addEventListener('resize', setNavbarHeight);
						
						// Set up search event listeners
						const searchInput = containerRef.current?.querySelector('input[type="search"]');
						
						if (searchInput) {
							// Handle search input changes
							const handleInput = (e) => {
								setSearchValue(e.target.value);
								const hasValue = e.target.value.trim().length > 0;
								setIsSearchOpen(hasValue);
								
								// Update global state
								if (typeof window !== "undefined" && window.navbarState) {
									window.navbarState.searchOpen = hasValue;
								}
							};
							
							// Handle search focus
							const handleFocus = () => {
								// Close menu dropdown if open
								if (typeof window !== "undefined" && window.navbarState?.menuOpen && window.navbarState?.closeMenu) {
									window.navbarState.closeMenu();
								}
								
								// Show results if there's a search value
								if (searchValue.trim().length > 0) {
									setIsSearchOpen(true);
									if (typeof window !== "undefined" && window.navbarState) {
										window.navbarState.searchOpen = true;
									}
								}
							};
							
							searchInput.addEventListener("input", handleInput);
							searchInput.addEventListener("focus", handleFocus);
						}
						
						// Handle clicks outside search to close results
						const handleClickOutside = (e) => {
							if (containerRef.current && !containerRef.current.contains(e.target)) {
								setIsSearchOpen(false);
								if (typeof window !== "undefined" && window.navbarState) {
									window.navbarState.searchOpen = false;
								}
							}
						};
						
						// Handle escape key to close search
						const handleEscape = (e) => {
							if (e.key === 'Escape' && isSearchOpen) {
								setIsSearchOpen(false);
								if (typeof window !== "undefined" && window.navbarState) {
									window.navbarState.searchOpen = false;
								}
								// Keep focus on search input
								const searchInput = containerRef.current?.querySelector('input[type="search"]');
								if (searchInput) {
									searchInput.focus();
								}
							}
						};
						
						document.addEventListener("click", handleClickOutside);
						document.addEventListener("keydown", handleEscape);
						
						// Add class to body when search is active
						if (isSearchOpen) {
							document.body.classList.add("search-active");
						} else {
							document.body.classList.remove("search-active");
						}
						
					}, 150);
				} catch (error) {
					console.error("Error initializing Pagefind UI:", error);
				}
			}
		}

		// Load Pagefind script if not already loaded
		if (!window.PagefindUI) {
			const script = document.createElement("script");
			script.type = "module";
			script.src = "/pagefind/pagefind-ui.js";
			script.onload = initPagefindUI;
			script.onerror = () => console.error("Failed to load Pagefind UI script");
			document.head.appendChild(script);
		} else {
			initPagefindUI();
		}

		return () => {
			// Cleanup
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			
			const existingStyle = document.getElementById('pagefind-override-styles');
			if (existingStyle) {
				existingStyle.remove();
			}
			
			document.body.classList.remove("search-active");
		};
	}, [isSearchOpen, searchValue]);

	// Update body class when search state changes
	useEffect(() => {
		if (isSearchOpen) {
			document.body.classList.add("search-active");
		} else {
			document.body.classList.remove("search-active");
		}
	}, [isSearchOpen]);

	return (
		<div
			className="search-results-container"
			ref={containerRef}
		></div>
	);
}
