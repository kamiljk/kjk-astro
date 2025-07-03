import React, { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
	{ key: "updated", label: "Latest", icon: "⏰" },
	{ key: "created", label: "Created", icon: "📅" },
	{ key: "alpha", label: "A→Z", icon: "🔤" },
];

const FILTER_OPTIONS = [
	{ key: "all", label: "All", color: "#6366f1" },
	{ key: "read", label: "Read", color: "#10b981" }, 
	{ key: "play", label: "Play", color: "#f59e0b" },
	{ key: "about", label: "About", color: "#8b5cf6" },
];

export default function NavbarMenuCompact({ 
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

	// Get filter option
	const getFilterOption = (key) => FILTER_OPTIONS.find(opt => opt.key === key) || { key, label: key, color: "#6b7280" };
	const getSortOption = (key) => SORT_OPTIONS.find(opt => opt.key === key) || { key, label: key, icon: "📄" };

	const activeTypeOption = getFilterOption(activeType);
	const activeSortOption = getSortOption(activeSort);

	// Debug logs for dropdown rendering
	console.log(`[Debug] menuOpen state: ${menuOpen}`);
	// console.log(`[Debug] portalTarget: ${portalTarget}`);

	return (
		<div ref={containerRef} className="navbar-menu-container">
			<button
				onClick={toggleMenu}
				aria-expanded={menuOpen}
				aria-label="Toggle menu"
				className="menu-trigger pill"
			>
				<div className="current-state">
					<div className="filter-badge" style={{backgroundColor: activeTypeOption.color}}>
						{activeType}
					</div>
					<div className="sort-indicator">
						<span className="sort-icon">{activeSortOption.icon}</span>
						{activeSort !== 'alpha' && (
							<span className="order-arrow">{activeOrder === 'desc' ? '↓' : '↑'}</span>
						)}
					</div>
				</div>
				<svg 
					className={`chevron ${menuOpen ? 'open' : ''}`}
					viewBox="0 0 24 24" 
					fill="none" 
					stroke="currentColor"
					strokeWidth="2"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{menuOpen && (
				<div className="menu-panel">
					{/* Inline Controls */}
					<div className="controls-row">
						{/* Filter Tabs */}
						<div className="filter-tabs">
							{taxonomy.map((item) => {
								const option = getFilterOption(item);
								return (
									<button
										key={item}
										className={`filter-tab pill${activeType === item ? ' active' : ''}`}
										onClick={() => handleType(item)}
										disabled={isDetailView}
										style={{
											'--tab-color': option.color,
											'--tab-color-light': option.color + '20'
										}}
									>
										{option.label}
									</button>
								);
							})}
						</div>

						{/* Sort Controls */}
						<div className="sort-group">
							<div className="sort-tabs">
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.key}
										disabled={isDetailView}
										className={`sort-tab pill${activeSort === opt.key ? ' active' : ''}`}
										onClick={() => !isDetailView && handleSort(opt.key)}
										title={opt.label}
									>
										<span className="tab-icon">{opt.icon}</span>
										<span className="tab-label">{opt.label}</span>
									</button>
								))}
							</div>
							{activeSort !== 'alpha' && (
								<div className="order-switch">
									<button
										disabled={isDetailView}
										className={`order-toggle pill${activeOrder === 'desc' ? ' active' : ''}`}
										onClick={() => !isDetailView && handleOrder('desc')}
										title="Newest first"
									>
										↓
									</button>
									<button
										disabled={isDetailView}
										className={`order-toggle pill${activeOrder === 'asc' ? ' active' : ''}`}
										onClick={() => !isDetailView && handleOrder('asc')}
										title="Oldest first"
									>
										↑
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Theme Controls */}
					{children && (
						<>
							<div className="divider"></div>
							<div className="theme-row">
								{children}
							</div>
						</>
					)}
				</div>
			)}

			<style jsx>{`
				.navbar-menu-container {
					position: relative;
					display: flex;
					align-items: center;
				}

				.menu-panel {
					position: absolute;
					top: calc(100% + 6px);
					right: 0;
					min-width: 320px;
					background: var(--color-bg);
					border: 1px solid var(--color-border);
					border-radius: 12px;
					box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
					z-index: 1000;
					animation: slideDown 0.2s ease;
				}

				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-4px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.controls-row {
					padding: 16px;
					display: flex;
					flex-direction: column;
					gap: 16px;
				}

				.filter-tabs {
					display: flex;
					gap: 4px;
					background: var(--color-bg-alt);
					padding: 4px;
					border-radius: 8px;
				}

				.sort-group {
					display: flex;
					align-items: center;
					gap: 8px;
				}

				.sort-tabs {
					display: flex;
					gap: 4px;
					flex: 1;
				}

				.tab-icon {
					font-size: 14px;
				}

				.tab-label {
					font-weight: 600;
				}

				.order-switch {
					display: flex;
					border: 1px solid var(--color-border);
					border-radius: 6px;
					overflow: hidden;
				}

				.divider {
					height: 1px;
					background: var(--color-border);
					margin: 0 16px;
				}

				.theme-row {
					padding: 12px 16px;
					display: flex;
					justify-content: center;
				}

				/* Mobile responsiveness */
				@media (max-width: 480px) {
					.menu-panel {
						right: -10px;
						left: -10px;
						min-width: unset;
					}
					
					.menu-trigger {
						min-width: 120px;
					}

					.sort-tabs {
						flex-direction: column;
						gap: 4px;
					}

					.sort-group {
						flex-direction: column;
						gap: 8px;
					}
				}

				@media (max-width: 768px) {
					.menu-panel {
						right: -15px;
						left: -15px;
					}
				}
			`}</style>
		</div>
	);
}
