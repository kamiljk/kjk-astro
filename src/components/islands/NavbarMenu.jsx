import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./NavbarMenu.module.css";

const SORT_OPTIONS = [
	{ key: "updated", label: "Updated" },
	{ key: "created", label: "Created" },
	{ key: "alpha", label: "A-Z" },
];

const ORDER_OPTIONS = [
	{ key: "asc", label: "↑" },
	{ key: "desc", label: "↓" },
];

export default function NavbarMenu({ taxonomy = ["all", "read", "play", "about"], type = "all", sort = "updated", order = "desc", children }) {
	// Deduplicate taxonomy array to avoid duplicate React keys
	const uniqueTaxonomy = Array.from(new Set(taxonomy));

	const [menuOpen, setMenuOpen] = useState(false);
	const btnRef = useRef(null);
	const [isClient, setIsClient] = useState(false);
	const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
	const menuRef = useRef(null); // fallback for event listeners
	const [portalTarget, setPortalTarget] = useState(null);

	// Always reflect current URL params for active state
	const getParam = (key, fallback) => {
		if (typeof window === 'undefined') return fallback;
		const url = new URL(window.location.href);
		return url.searchParams.get(key) || fallback;
	};
	const activeType = getParam('type', type);
	const activeSort = getParam('sort', sort);
	// For 'alpha', force order to 'asc', else use param or default
	const activeOrder = activeSort === 'alpha' ? 'asc' : getParam('order', order);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const target = document.querySelector(".navbar-header-row");
			setPortalTarget(target);
		}
	}, []);

	// --- URL param update helpers ---
	function updateUrlParams(params) {
		// Always reset to listing page when updating filters/sort
		const listingPath = window.location.origin + '/';
		const url = new URL(listingPath);
		Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
		url.searchParams.set('page', '1');
		window.location.href = url.toString();
	}

	const handleType = (item) => {
		updateUrlParams({ type: item });
	};
	const handleSort = (key) => {
		// 'alpha' always uses 'asc', others default to 'desc'
		updateUrlParams({ sort: key, order: key === 'alpha' ? 'asc' : 'desc' });
	};
	const handleOrder = (orderKey) => {
		updateUrlParams({ order: orderKey });
	};

	// Close menu on outside click, scroll, and Escape; restore focus
	useEffect(() => {
		function handleClickOutside(e) {
			// DEBUG: log click target and refs
			console.log('Dropdown: handleClickOutside', {
				target: e.target,
				menu: menuRef.current,
				btn: btnRef.current,
				menuContains: menuRef.current && menuRef.current.contains(e.target),
				btnContains: btnRef.current && btnRef.current.contains(e.target)
			});
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target) &&
				btnRef.current &&
				!btnRef.current.contains(e.target)
			) {
				setMenuOpen(false);
			}
		}
		function handleScroll() {
			setMenuOpen(false);
		}
		function handleKeyDown(e) {
			if (e.key === "Escape") {
				setMenuOpen(false);
				// Restore focus to button after closing
				setTimeout(() => {
					btnRef.current && btnRef.current.focus();
				}, 0);
			}
		}
		if (menuOpen) {
			document.body.classList.add("menu-open");
			document.addEventListener("click", handleClickOutside);
			window.addEventListener("scroll", handleScroll, { passive: true });
			document.addEventListener("keydown", handleKeyDown);
		} else {
			document.body.classList.remove("menu-open");
		}
		return () => {
			document.body.classList.remove("menu-open");
			document.removeEventListener("click", handleClickOutside);
			window.removeEventListener("scroll", handleScroll);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [menuOpen]);

	// Restore focus to button when menu closes (from any cause)
	useEffect(() => {
		if (!menuOpen) {
			btnRef.current && btnRef.current.focus();
		}
	}, [menuOpen]);

	// Callback ref for menu container to focus first pill on mount (deferred, with retry)
	const menuCallbackRef = node => {
		menuRef.current = node;
		if (node && menuOpen) {
			let tries = 0;
			function tryFocus() {
				const firstPill = node.querySelector('.pill');
				if (firstPill) {
					firstPill.focus();
					if (document.activeElement !== firstPill && tries < 5) {
						tries++;
						setTimeout(tryFocus, 50);
					}
				} else if (tries < 5) {
					tries++;
					setTimeout(tryFocus, 50);
				}
			}
			setTimeout(tryFocus, 50);
		}
	};

	// Show/hide menu with animation
	useEffect(() => {
		if (menuOpen) {
			setShouldRenderMenu(true);
		} else {
			setShouldRenderMenu(false); // Immediately unmount when closed
		}
	}, [menuOpen]);

	// Add keyboard navigation for pills
	useEffect(() => {
		if (!menuOpen || !menuRef.current) return;
		const menu = menuRef.current;
		function handlePillKeyDown(e) {
			const pills = Array.from(menu.querySelectorAll('.pill'));
			if (!pills.length) return;
			const active = document.activeElement;
			let idx = pills.indexOf(active);
			if (idx === -1) idx = 0;
			if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
				e.preventDefault();
				pills[(idx + 1) % pills.length].focus();
			} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
				e.preventDefault();
				pills[(idx - 1 + pills.length) % pills.length].focus();
			} else if (e.key === 'Home') {
				e.preventDefault();
				pills[0].focus();
			} else if (e.key === 'End') {
				e.preventDefault();
				pills[pills.length - 1].focus();
			}
		}
		menu.addEventListener('keydown', handlePillKeyDown);
		return () => menu.removeEventListener('keydown', handlePillKeyDown);
	}, [menuOpen]);

	// --- Scroll dismiss debounce and fade-out logic ---
	const [fadeOut, setFadeOut] = useState(false);
	const scrollTimeout = useRef(null);
	const lastScrollY = useRef(0);
	const scrollStartTime = useRef(null);
	const scrollDismissAllowed = useRef(false);

	// Start a timer when menu opens to allow scroll dismiss only after a delay
	useEffect(() => {
		if (!isClient) return;
		if (menuOpen) {
			scrollDismissAllowed.current = false;
			const timer = setTimeout(() => {
				scrollDismissAllowed.current = true;
			}, 2500); // 2.5s before scroll can dismiss
			return () => clearTimeout(timer);
		} else {
			scrollDismissAllowed.current = false;
		}
	}, [menuOpen, isClient]);

	useEffect(() => {
		if (!isClient) return;
		function handleScroll() {
			if (!menuOpen) return;
			if (!scrollDismissAllowed.current) return;
			const now = Date.now();
			const y = window.scrollY;
			if (scrollStartTime.current === null) {
				scrollStartTime.current = now;
				lastScrollY.current = y;
			}
			if (Math.abs(y - lastScrollY.current) > 24 || (now - scrollStartTime.current > 300)) {
				setFadeOut(true);
				setTimeout(() => {
					setMenuOpen(false);
					setFadeOut(false);
				}, 320);
				scrollStartTime.current = null;
				lastScrollY.current = y;
				return;
			}
			clearTimeout(scrollTimeout.current);
			scrollTimeout.current = setTimeout(() => {
				scrollStartTime.current = null;
				lastScrollY.current = window.scrollY;
			}, 350);
		}
		if (menuOpen) {
			window.addEventListener("scroll", handleScroll, { passive: true });
		}
		return () => {
			window.removeEventListener("scroll", handleScroll);
			clearTimeout(scrollTimeout.current);
			scrollStartTime.current = null;
		};
	}, [menuOpen, isClient]);

	// Detect if currently viewing a single card/detail
	const isCardView = isClient && typeof window !== 'undefined' && window.location.pathname !== '/';

	return (
		<>
			<button
				ref={btnRef}
				onClick={e => {
					e.stopPropagation();
					setMenuOpen((prev) => !prev);
				}}
				aria-expanded={menuOpen ? "true" : "false"}
				className={`nav__menu-btn menu-toggle-btn${menuOpen ? " open" : ""}`}
				aria-label="Open menu"
			>
				<svg
					className={`menu-toggle-arrow${menuOpen ? " open" : ""}`}
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>
			{menuOpen && portalTarget && ReactDOM.createPortal(
				<div
					id="filter-sort-menu"
					className={`menu-container visible${fadeOut ? ' fade-out' : ''}`}
					ref={menuCallbackRef}
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: '100%',
						margin: '0 auto',
						width: '100%',
						maxWidth: 'var(--dropdown-max-width)',
						zIndex: 9999
					}}
				>
					<div className="menu-content">
						<div className="menu-section filter-section">
							{uniqueTaxonomy.map((item) => (
								<button
									key={item}
									className={`pill${activeType === item ? ` active ${styles["pill-active"]}` : ''}`}
									onClick={() => handleType(item)}
									aria-current={activeType === item ? "page" : undefined}
									style={{ borderRadius: '8px' }}
									tabIndex={0}
								>
									{item}
								</button>
							))}
						</div>
						<div className="menu-section sort-section" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							{SORT_OPTIONS.map((opt) => (
								<div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
									<button
										disabled={isCardView}
										className={`pill${activeSort === opt.key ? ` active ${styles["pill-active"]}` : ''}`}
										onClick={() => !isCardView && handleSort(opt.key)}
										aria-current={activeSort === opt.key ? "page" : undefined}
										style={{ borderRadius: '8px' }}
										tabIndex={0}
									>
										{opt.label}
									</button>
									{/* Show order arrows for non-alpha sorts */}
									{activeSort === opt.key && opt.key !== 'alpha' && (
										<span className="sort-arrows">
											<button
												disabled={isCardView}
												className={`sort-arrow${activeOrder === 'asc' ? ' active' : ''}`}
												aria-label="Sort ascending"
												onClick={() => !isCardView && handleOrder('asc')}
												tabIndex={0}
												type="button"
											>
												▲
											</button>
											<button
												disabled={isCardView}
												className={`sort-arrow${activeOrder === 'desc' ? ' active' : ''}`}
												aria-label="Sort descending"
												onClick={() => !isCardView && handleOrder('desc')}
												tabIndex={0}
												type="button"
											>
												▼
											</button>
										</span>
									)}
								</div>
							))}
						</div>
						<div className="menu-section theme-toggle-section">
							{Array.isArray(children)
								? children.filter(React.isValidElement).map((child, i) =>
									React.cloneElement(child, { id: 'theme-toggle-btn-' + i })
								)
								: React.isValidElement(children)
									? React.cloneElement(children, { id: 'theme-toggle-btn' })
									: null}
						</div>
					</div>
				</div>,
				portalTarget
			)}
		</>
	);
}
