import React, { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
	{ key: "updated", label: "Updated" },
	{ key: "created", label: "Created" },
	{ key: "alpha", label: "A-Z" },
];

export default function NavbarMenu({ 
	taxonomy = ["all", "read", "play", "about"], 
	type = "all", 
	sort = "updated", 
	order = "desc", 
	children 
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const containerRef = useRef(null);

	// Get current URL params for active states
	// Refactor getParam to avoid SSR issues
	const getParam = (key, fallback) => {
		if (typeof window === 'undefined') {
			console.warn(`[Debug] SSR detected, returning fallback for ${key}`);
			return fallback;
		}
		const url = new URL(window.location.href);
		return url.searchParams.get(key) || fallback;
	};

	const activeType = getParam('type', type);
	const activeSort = getParam('sort', sort);
	const activeOrder = activeSort === 'alpha' ? 'asc' : getParam('order', order);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// URL navigation helper
	const updateUrlParams = (params) => {
		const url = new URL(window.location.origin + '/');
		Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
		url.searchParams.set('page', '1');
		window.location.href = url.toString();
	};

	// Event handlers
	const handleType = (item) => updateUrlParams({ type: item });
	const handleSort = (key) => updateUrlParams({ 
		sort: key, 
		order: key === 'alpha' ? 'asc' : 'desc' 
	});
	const handleOrder = (orderKey) => updateUrlParams({ order: orderKey });

	// Menu management
	useEffect(() => {
		if (!menuOpen) return;

		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};

		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				setMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [menuOpen]);

	// Check if we're in a detail view (disable sort/filter)
	const isDetailView = isClient && window.location.pathname !== '/';

	const toggleMenu = (e) => {
		e.stopPropagation();
		setMenuOpen(!menuOpen);
	};

	// Debug logs for dropdown rendering
	console.log(`[Debug] menuOpen state: ${menuOpen}`);
	// console.log(`[Debug] portalTarget: ${portalTarget}`);

	return (
		<div ref={containerRef} className="navbar-menu-container">
			<button
				onClick={toggleMenu}
				aria-expanded={menuOpen}
				aria-label="Toggle menu"
				className="menu-button pill"
			>
				<svg 
					className={`menu-icon ${menuOpen ? 'open' : ''}`}
					viewBox="0 0 24 24" 
					fill="none" 
					stroke="currentColor"
					strokeWidth="2"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{menuOpen && (
				<div className="menu-dropdown">
					<div className="menu-content">
						{/* Filter Section */}
						<div className="menu-section">
							<span className="section-label">Filter</span>
							<div className="button-group">
								{taxonomy.map((item) => (
									<button
										key={item}
										className={`menu-btn pill${activeType === item ? ' active' : ''}`}
										onClick={() => handleType(item)}
									>
										{item}
									</button>
								))}
							</div>
						</div>

						{/* Sort Section */}
						<div className="menu-section">
							<span className="section-label">Sort</span>
							<div className="button-group">
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.key}
										disabled={isDetailView}
										className={`menu-btn pill${activeSort === opt.key ? ' active' : ''}`}
										onClick={() => !isDetailView && handleSort(opt.key)}
									>
										{opt.label}
									</button>
								))}
								{activeSort !== 'alpha' && (
									<div className="order-controls">
										<button
											disabled={isDetailView}
											className={`glyph-btn` + (activeOrder === 'desc' ? ' active' : '')}
											onClick={() => !isDetailView && handleOrder('desc')}
											title="Sort descending"
											aria-label="Sort descending"
											type="button"
										>
											↓
										</button>
										<button
											disabled={isDetailView}
											className={`glyph-btn` + (activeOrder === 'asc' ? ' active' : '')}
											onClick={() => !isDetailView && handleOrder('asc')}
											title="Sort ascending"
											aria-label="Sort ascending"
											type="button"
										>
											↑
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Theme Section */}
						<div className="menu-section theme-section">
							{children}
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				.navbar-menu-container {
					position: relative;
					display: flex;
					align-items: center;
				}

				.menu-dropdown {
					position: absolute;
					top: calc(100% + 5px);
					right: 0;
					min-width: 320px;
					max-width: 420px;
					z-index: 1000;
					overflow: visible;
					box-sizing: border-box;
					padding: 4px; /* Extra padding to prevent hover clipping */
					
					background: var(--frosted-bg);
					backdrop-filter: var(--frosted-blur);
					-webkit-backdrop-filter: var(--frosted-blur);
					border: var(--border-unified);
					border-radius: var(--radius-unified);
					box-shadow: var(--shadow-elevation-3);
					
					animation: slideDown 0.2s ease-out;
				}

				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-8px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.menu-content {
					padding: calc(1rem - 4px); /* Adjust for dropdown padding */
					display: flex;
					flex-direction: column;
					gap: 1rem;
					overflow: visible;
					box-sizing: border-box;
				}

				.menu-section {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
					overflow: visible;
					box-sizing: border-box;
					padding: 2px; /* Extra space for hover transform */
				}

				.section-label {
					font-size: 0.75rem;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					color: var(--color-text-muted);
					margin-bottom: 0.25rem;
				}

				.button-group {
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem;
					align-items: center;
					overflow: visible;
					box-sizing: border-box;
					padding: 2px; /* Extra space for hover transform */
				}

				.order-controls {
					display: flex;
					gap: 0.25rem;
					margin-left: 0.5rem;
					overflow: visible;
					box-sizing: border-box;
					flex-shrink: 0;
					padding: 2px; /* Extra space for hover transform */
				}

				.theme-section {
					border-top: 1px solid var(--color-border);
					padding-top: 1rem;
					margin-top: 0.5rem;
				}

				@media (max-width: 768px) {
					.menu-dropdown {
						right: -1rem;
						left: -1rem;
						min-width: unset;
						max-width: unset;
					}
				}

				@media (max-width: 480px) {
					.menu-dropdown {
						right: -2rem;
						left: -2rem;
					}
					
					.menu-btn {
						flex: 1;
						min-width: 0;
					}
				}
			`}</style>
		</div>
	);
}
