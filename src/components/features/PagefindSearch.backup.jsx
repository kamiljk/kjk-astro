import React, { useEffect, useRef, useState } from "react";

export default function PagefindSearch() {
	const containerRef = useRef(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");

	useEffect(() => {
		let timeoutId = null;
		let observer = null;

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

					// Single timeout to add enhanced CSS overrides
					timeoutId = setTimeout(() => {
						const existingStyle = document.getElementById('pagefind-override-styles');
						if (!existingStyle) {
							const globalStyle = document.createElement('style');
							globalStyle.id = 'pagefind-override-styles';
							globalStyle.textContent = `
								/* === ENHANCED SEARCH RESULTS STYLING === */
								
								/* FOUC Prevention - Hide elements by default */
								.search-results-container .pagefind-ui__search-clear {
									display: none !important;
									opacity: 0 !important;
									visibility: hidden !important;
								}

								.search-results-container .pagefind-ui__message {
									display: none !important;
									opacity: 0 !important;
									visibility: hidden !important;
								}
								
								/* Search container - maintain navbar integration */
								.search-results-container [data-pagefind-ui] {
									width: 100% !important;
									flex: 1 1 auto !important;
									position: relative !important;
								}
								
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
								
								/* Clear button styling - enhanced FOUC prevention */
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
									opacity: 0 !important;
									visibility: hidden !important;
									display: none !important;
									transition: opacity 0.2s ease, visibility 0.2s ease !important;
									align-items: center !important;
									justify-content: center !important;
									padding: 0 !important;
									margin: 0 !important;
									box-shadow: none !important;
									outline: none !important;
									z-index: 2;
									font-size: 0 !important;
									text-indent: -9999px !important;
									overflow: hidden !important;
									color: transparent !important;
								}
								
								/* Clear button X icon */
								.search-results-container .pagefind-ui__search-clear::before {
									content: "✕" !important;
									font-size: 14px !important;
									color: var(--color-desc) !important;
									line-height: 1 !important;
									display: block !important;
								}
								
								/* Show clear button when search has content - controlled by JS */
								.search-results-container .pagefind-ui__form.has-content .pagefind-ui__search-clear {
									display: flex !important;
									opacity: 0.6 !important;
									visibility: visible !important;
								}
								
								.search-results-container .pagefind-ui__search-clear:hover {
									opacity: 1 !important;
								}
								
								.search-results-container .pagefind-ui__search-clear:hover::before {
									color: var(--color-text) !important;
								}
								
								/* Hide all text content in clear button */
								.search-results-container .pagefind-ui__search-clear * {
									display: none !important;
								}
								
								.search-results-container .pagefind-ui__search-clear .svelte-e9gkc3 {
									display: none !important;
									visibility: hidden !important;
									font-size: 0 !important;
								}
								
								/* === SEARCH RESULTS DROPDOWN === */
								
								/* Main results container - smooth slide from under navbar */
								.search-results-container .pagefind-ui__drawer {
									position: fixed !important;
									top: var(--navbar-height, 76px) !important;
									left: 0 !important;
									right: 0 !important;
									max-width: var(--navbar-max-width, 1200px) !important;
									width: 100% !important;
									margin: 0 auto !important;
									z-index: 99999 !important;
									
									/* Use design tokens for frosted glass effect - enhanced specificity */
									background: var(--frosted-bg) !important;
									backdrop-filter: var(--frosted-blur) !important;
									-webkit-backdrop-filter: var(--frosted-blur) !important;
									border: var(--frosted-border) !important;
									box-shadow: var(--frosted-shadow) !important;
									border-radius: 0 0 var(--radius-unified) var(--radius-unified) !important;
									border-top: none !important;
									
									/* Ensure frosted glass works properly - enhanced stacking context */
									isolation: isolate !important;
									contain: layout style paint !important;
									will-change: transform, opacity !important;
									
									/* Smooth slide animation */
									opacity: 0 !important;
									transform: translateY(-10px) !important;
									transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
									           transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
									pointer-events: none !important;
									visibility: hidden !important;
									
									max-height: 400px !important;
									overflow-y: auto !important;
									margin: 0 auto !important;
									padding: 0 !important;
								}
								
								/* Show results when search is active */
								.search-results-container .pagefind-ui__drawer:not(.pagefind-ui__hidden) {
									opacity: 1 !important;
									transform: translateY(0) !important;
									pointer-events: auto !important;
									visibility: visible !important;
									/* Ensure backdrop filter is maintained when visible */
									backdrop-filter: var(--frosted-blur) !important;
									-webkit-backdrop-filter: var(--frosted-blur) !important;
								}
								
								/* Ensure content area doesn't interfere with frosted glass */
								.search-results-container .pagefind-ui__results {
									display: flex !important;
									flex-direction: column !important;
									gap: var(--fluid-space-s) !important;
									width: 100% !important;
									padding: clamp(var(--fluid-space-s), 3vw, var(--fluid-space-m)) !important;
									margin: 0 !important;
									box-sizing: border-box !important;
									background: transparent !important;
									/* Removed backdrop-filter: none to allow parent's backdrop filter to work */
								}
								
								/* Individual search result styling */
								.search-results-container .pagefind-ui__result {
									padding: var(--fluid-space-xs) !important;
									border-radius: var(--radius-btn) !important;
									transition: background-color 0.2s ease !important;
									background: transparent !important;
									border: none !important;
									margin: 0 !important;
								}
								
								.search-results-container .pagefind-ui__result:hover {
									background: var(--color-bg-alt) !important;
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
									margin-bottom: var(--fluid-space-2xs) !important;
									color: var(--color-text) !important;
								}
								
								/* Result excerpt styling */
								.search-results-container .pagefind-ui__result-excerpt {
									color: var(--color-desc) !important;
									font-size: 0.9em !important;
									line-height: 1.4 !important;
								}
								
								/* Search message styling - enhanced FOUC prevention */
								.search-results-container .pagefind-ui__message {
									padding: var(--fluid-space-xs) var(--fluid-space-s) !important;
									color: var(--color-desc) !important;
									font-size: 0.9em !important;
									border-bottom: 1px solid var(--color-border) !important;
									margin: 0 !important;
									display: none !important;
									opacity: 0 !important;
									visibility: hidden !important;
								}
								
								/* Only show helpful messages, hide loading/error states */
								.search-results-container .pagefind-ui__message.pagefind-helpful {
									display: block !important;
									opacity: 1 !important;
									visibility: visible !important;
								}
								
								/* Hide default text content in clear button */
								.search-results-container .pagefind-ui__search-clear {
									font-size: 0 !important;
									text-indent: -9999px !important;
									overflow: hidden !important;
								}
								
								.search-results-container .pagefind-ui__search-clear * {
									display: none !important;
								}
								
								.search-results-container .pagefind-ui__search-clear .svelte-e9gkc3 {
									display: none !important;
									visibility: hidden !important;
									font-size: 0 !important;
								}
								
								/* Scrollbar styling for results */
								.search-results-container .pagefind-ui__drawer::-webkit-scrollbar {
									width: 6px;
								}
								
								.search-results-container .pagefind-ui__drawer::-webkit-scrollbar-track {
									background: transparent;
								}
								
								.search-results-container .pagefind-ui__drawer::-webkit-scrollbar-thumb {
									background: var(--color-border);
									border-radius: 3px;
								}
								
								.search-results-container .pagefind-ui__drawer::-webkit-scrollbar-thumb:hover {
									background: var(--color-desc);
								}
								
								/* Force backdrop filter on search results container - override any conflicts */
								.search-results-container .pagefind-ui__drawer,
								.search-results-container .pagefind-ui__drawer:not(.pagefind-ui__hidden),
								.search-results-container .pagefind-ui__drawer[style] {
									backdrop-filter: var(--frosted-blur) !important;
									-webkit-backdrop-filter: var(--frosted-blur) !important;
									-moz-backdrop-filter: var(--frosted-blur) !important;
									background: var(--frosted-bg) !important;
								}
								
								/* Ultra-specific selector to override any Pagefind defaults */
								div.search-results-container div.pagefind-ui__drawer {
									backdrop-filter: var(--frosted-blur) !important;
									-webkit-backdrop-filter: var(--frosted-blur) !important;
									-moz-backdrop-filter: var(--frosted-blur) !important;
									background: var(--frosted-bg) !important;
								}
								
								/* Target by attribute selector in case classes change */
								.search-results-container [class*="pagefind-ui__drawer"] {
									backdrop-filter: var(--frosted-blur) !important;
									-webkit-backdrop-filter: var(--frosted-blur) !important;
									-moz-backdrop-filter: var(--frosted-blur) !important;
									background: var(--frosted-bg) !important;
								}
								
								/* Ensure the search container itself doesn't block backdrop filters */
								.search-results-container {
									backdrop-filter: none !important;
									-webkit-backdrop-filter: none !important;
									background: transparent !important;
								}
								
								/* Ensure backdrop filter support detection */
								@supports not (backdrop-filter: blur(1px)) {
									.search-results-container .pagefind-ui__drawer {
										background: var(--color-bg) !important;
										opacity: 0.95 !important;
									}
								}
							`;
							document.head.appendChild(globalStyle);
						}

						// Set up search event listeners for enhanced behavior
						const searchInput = containerRef.current?.querySelector('input[type="search"]');
						const searchForm = containerRef.current?.querySelector('.pagefind-ui__form');
						const searchDrawer = containerRef.current?.querySelector('.pagefind-ui__drawer');
						
						// Force backdrop filter on search drawer with JavaScript as fallback
						const forceBackdropFilter = () => {
							const drawer = containerRef.current?.querySelector('.pagefind-ui__drawer');
							if (drawer) {
								// Get computed values to debug
								const computedStyle = window.getComputedStyle(document.documentElement);
								const frostedBlur = computedStyle.getPropertyValue('--frosted-blur').trim();
								const frostedBg = computedStyle.getPropertyValue('--frosted-bg').trim();
								
								console.log('CSS Variables:', { frostedBlur, frostedBg });
								
								drawer.style.setProperty('backdrop-filter', 'var(--frosted-blur)', 'important');
								drawer.style.setProperty('-webkit-backdrop-filter', 'var(--frosted-blur)', 'important');
								drawer.style.setProperty('-moz-backdrop-filter', 'var(--frosted-blur)', 'important');
								drawer.style.setProperty('background', 'var(--frosted-bg)', 'important');
								
								// Also try with explicit values as fallback
								if (frostedBlur) {
									drawer.style.setProperty('backdrop-filter', frostedBlur, 'important');
									drawer.style.setProperty('-webkit-backdrop-filter', frostedBlur, 'important');
								}
								if (frostedBg) {
									drawer.style.setProperty('background', frostedBg, 'important');
								}
								
								console.log('Forced backdrop filter on search drawer:', drawer);
								console.log('Final computed backdrop-filter:', window.getComputedStyle(drawer).backdropFilter);
								console.log('Final computed -webkit-backdrop-filter:', window.getComputedStyle(drawer).webkitBackdropFilter);
							}
						};
						
						// Apply backdrop filter immediately and on mutations
						setTimeout(forceBackdropFilter, 100);
						setTimeout(forceBackdropFilter, 300);
						setTimeout(forceBackdropFilter, 500);
						
						// Load debug script for enhanced debugging
						const debugScript = document.createElement('script');
						debugScript.src = '/debug-backdrop-filter.js';
						document.head.appendChild(debugScript);
						
						// Watch for when Pagefind creates new elements
						observer = new MutationObserver((mutations) => {
							mutations.forEach((mutation) => {
								mutation.addedNodes.forEach((node) => {
									if (node.nodeType === 1 && (
										node.classList?.contains('pagefind-ui__drawer') || 
										node.querySelector?.('.pagefind-ui__drawer')
									)) {
										console.log('Pagefind drawer detected, applying backdrop filter');
										setTimeout(forceBackdropFilter, 10);
									}
								});
							});
						});
						
						if (containerRef.current) {
							observer.observe(containerRef.current, { 
								childList: true, 
								subtree: true 
							});
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
								
								// Control clear button visibility
								const searchForm = containerRef.current?.querySelector('.pagefind-ui__form');
								if (searchForm) {
									if (hasValue) {
										searchForm.classList.add('has-content');
									} else {
										searchForm.classList.remove('has-content');
									}
								}
								
								// Force backdrop filter when search becomes active
								if (hasValue) {
									setTimeout(forceBackdropFilter, 50);
								}
								
								// Hide loading/error messages
								setTimeout(() => {
									const messages = containerRef.current?.querySelectorAll('.pagefind-ui__message');
									if (messages) {
										messages.forEach(message => {
											const text = message.textContent.toLowerCase();
											if (text.includes('loading') || text.includes('no results') || text.includes('error')) {
												message.style.display = 'none';
												message.style.opacity = '0';
												message.style.visibility = 'hidden';
											}
										});
									}
								}, 50);
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
							
							// Handle clear button
							const handleClear = () => {
								setSearchValue("");
								setIsSearchOpen(false);
								if (typeof window !== "undefined" && window.navbarState) {
									window.navbarState.searchOpen = false;
								}
								searchInput.focus();
							};
							
							searchInput.addEventListener("input", handleInput);
							searchInput.addEventListener("focus", handleFocus);
							
							// Handle clear button if it exists
							const clearButton = containerRef.current?.querySelector('.pagefind-ui__search-clear');
							if (clearButton) {
								clearButton.addEventListener("click", handleClear);
							}
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
			
			// Cleanup mutation observer
			if (observer) {
				observer.disconnect();
			}
			
			// Remove event listeners
			const handleClickOutside = (e) => {
				if (containerRef.current && !containerRef.current.contains(e.target)) {
					setIsSearchOpen(false);
				}
			};
			
			const handleEscape = (e) => {
				if (e.key === 'Escape' && isSearchOpen) {
					setIsSearchOpen(false);
				}
			};
			
			const setNavbarHeight = () => {
				const navbar = document.querySelector('nav') || document.querySelector('[data-navbar]') || document.querySelector('.navbar');
				if (navbar) {
					const navbarHeight = navbar.getBoundingClientRect().height;
					document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
				}
			};
			
			document.removeEventListener("click", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
			window.removeEventListener('resize', setNavbarHeight);
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
