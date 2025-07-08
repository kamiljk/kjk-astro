import React, { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
	{ key: "activity", label: "Activity", icon: "" },
	{ key: "created", label: "Created", icon: "" },
	{ key: "alpha", label: "A→Z", icon: "" },
];

const FILTER_OPTIONS = [
	{ key: "all", label: "All" },
	{ key: "read", label: "Read" },
	{ key: "play", label: "Play" },
	{ key: "about", label: "About" },
];

export default function NavbarMenuElegant({ 
	taxonomy = ["all", "read", "play", "about"], 
	type = "all", 
	sort = "activity", 
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

	// Get filter option with icon
	const getFilterOption = (key) => FILTER_OPTIONS.find(opt => opt.key === key) || { key, label: key, icon: "📄" };

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
				<div className="menu-button-content">
					<div className="current-filters">
						<span className="filter-indicator">
							{getFilterOption(activeType).icon}
						</span>
						<span className="filter-text">{activeType.toUpperCase()}</span>
					</div>
					<svg 
						className={`menu-icon ${menuOpen ? 'open' : ''}`}
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor"
						strokeWidth="2"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>
			</button>

			{menuOpen && (
				<div className="menu-dropdown">
					<div className="menu-content">
						{/* Main Controls Grid */}
						<div className="controls-grid">
							{/* Filter Pills */}
							<div className="control-section">
								<h4 className="section-title">
									<span className="section-icon">🏷️</span>
									Filter Content
								</h4>
								<div className="pill-grid">
									{taxonomy.map((item) => {
										const option = getFilterOption(item);
										return (
											<button
												key={item}
												className={`control-pill pill${activeType === item ? ' active' : ''}`}
												onClick={() => handleType(item)}
												disabled={isDetailView}
											>
												<span className="pill-icon">{option.icon}</span>
												<span className="pill-label">{option.label}</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Sort Controls */}
							<div className="control-section">
								<h4 className="section-title">
									<span className="section-icon">⚡</span>
									Sort & Order
								</h4>
								<div className="sort-controls">
									<div className="sort-pills">
										{SORT_OPTIONS.map((opt) => (
											<button
												key={opt.key}
												disabled={isDetailView}
												className={`control-pill sort-pill pill${activeSort === opt.key ? ' active' : ''}`}
												onClick={() => !isDetailView && handleSort(opt.key)}
											>
												<span className="pill-icon">{opt.icon}</span>
												<span className="pill-label">{opt.label}</span>
											</button>
										))}
									</div>
									{activeSort !== 'alpha' && (
										<div className="order-toggle">
											<button
												disabled={isDetailView}
												className={`order-btn pill${activeOrder === 'desc' ? ' active' : ''}`}
												onClick={() => !isDetailView && handleOrder('desc')}
												title="Newest first"
											>
												<span className="order-icon">↓</span>
												<span className="order-text">New</span>
											</button>
											<button
												disabled={isDetailView}
												className={`order-btn pill${activeOrder === 'asc' ? ' active' : ''}`}
												onClick={() => !isDetailView && handleOrder('asc')}
												title="Oldest first" 
											>
												<span className="order-icon">↑</span>
												<span className="order-text">Old</span>
											</button>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Divider */}
						<div className="menu-divider"></div>

						{/* Theme & Settings */}
						<div className="settings-section">
							<h4 className="section-title">
								<span className="section-icon">🎨</span>
								Appearance
							</h4>
							<div className="theme-controls">
								{children}
							</div>
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
					top: calc(100% + 8px);
					right: 0;
					min-width: 380px;
					max-width: 460px;
					z-index: 1000;
					
					background: var(--color-bg);
					backdrop-filter: blur(20px);
					border: 1px solid var(--color-border);
					border-radius: 16px;
					box-shadow: 
						0 20px 40px -12px rgba(0, 0, 0, 0.25),
						0 8px 16px -8px rgba(0, 0, 0, 0.1);
					
					animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
				}

				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateY(-8px) scale(0.95);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}

				.menu-content {
					padding: 20px;
				}

				.controls-grid {
					display: flex;
					flex-direction: column;
					gap: 24px;
				}

				.control-section {
					display: flex;
					flex-direction: column;
					gap: 12px;
				}

				.section-title {
					display: flex;
					align-items: center;
					gap: 8px;
					margin: 0;
					font-size: 14px;
					font-weight: 600;
					color: var(--color-text);
					opacity: 0.8;
				}

				.section-icon {
					font-size: 16px;
				}

				.pill-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 8px;
				}

				.sort-controls {
					display: flex;
					flex-direction: column;
					gap: 12px;
				}

				.sort-pills {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 8px;
				}

				.order-toggle {
					display: flex;
					gap: 8px;
					justify-content: center;
				}

				.order-icon {
					font-size: 14px;
				}

				.order-text {
					font-size: 11px;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}

				.menu-divider {
					height: 1px;
					background: linear-gradient(
						90deg,
						transparent 0%,
						var(--color-border) 20%,
						var(--color-border) 80%,
						transparent 100%
					);
					margin: 20px 0;
				}

				.settings-section {
					display: flex;
					flex-direction: column;
					gap: 12px;
				}

				.theme-controls {
					display: flex;
					justify-content: center;
				}

				/* Mobile responsiveness */
				@media (max-width: 480px) {
					.menu-dropdown {
						right: -10px;
						left: -10px;
						min-width: unset;
						max-width: unset;
					}
					
					.menu-button {
						min-width: 100px;
					}

					.pill-grid {
						grid-template-columns: 1fr;
					}

					.sort-pills {
						grid-template-columns: 1fr;
					}
				}

				@media (max-width: 768px) {
					.menu-dropdown {
						right: -20px;
						left: -20px;
						min-width: unset;
					}
				}
			`}</style>
		</div>
	);
}
