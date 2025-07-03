import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./NavbarMenuImproved.module.css";

const SORT_OPTIONS = [
	{ key: "updated", label: "Updated", icon: "🔄" },
	{ key: "created", label: "Created", icon: "📅" },
	{ key: "alpha", label: "A-Z", icon: "🔤" },
];

export default function NavbarMenuImproved({ 
	taxonomy = ["all", "read", "play", "about"], 
	type = "all", 
	sort = "updated", 
	order = "desc", 
	children 
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const btnRef = useRef(null);
	const menuRef = useRef(null);
	const [portalTarget, setPortalTarget] = useState(null);

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
		if (typeof window !== "undefined") {
			const target = document.querySelector("#navbar-dropdown-portal");
			setPortalTarget(target);
		}
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

	// Simplified menu management
	useEffect(() => {
		if (!menuOpen) return;

		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target) && 
				btnRef.current && !btnRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};

		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				setMenuOpen(false);
				btnRef.current?.focus();
			}
		};

		const handleScroll = () => setMenuOpen(false);

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
		window.addEventListener('scroll', handleScroll, { passive: true });
		document.body.classList.add('menu-open');

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
			window.removeEventListener('scroll', handleScroll);
			document.body.classList.remove('menu-open');
		};
	}, [menuOpen]);

	// Check if we're in a detail view (disable sort/filter)
	const isDetailView = isClient && window.location.pathname !== '/';

	const toggleMenu = (e) => {
		e.stopPropagation();
		setMenuOpen(!menuOpen);
	};

	// Get current filter display info
	const getCurrentFilter = () => {
		const item = taxonomy.find(t => t === activeType) || 'all';
		const icons = { all: '🌐', read: '📖', play: '🎮', about: 'ℹ️' };
		return { label: item.toUpperCase(), icon: icons[item] || '🌐' };
	};

	const currentFilter = getCurrentFilter();

	// Debug logs for dropdown rendering
	console.log(`[Debug] menuOpen state: ${menuOpen}`);
	console.log(`[Debug] portalTarget: ${portalTarget}`);

	return (
		<div className={styles.menuContainer}>
			<button
				ref={btnRef}
				onClick={toggleMenu}
				aria-expanded={menuOpen}
				aria-label="Filter and sort menu"
				className={styles.menuButton}
			>
				<div className={styles.buttonContent}>
					<span className={styles.currentState}>
						<span className={styles.stateIcon}>{currentFilter.icon}</span>
						<span className={styles.stateText}>{currentFilter.label}</span>
					</span>
					<svg 
						className={`${styles.chevron} ${menuOpen ? styles.open : ''}`}
						width="16" 
						height="16" 
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor" 
						strokeWidth="2"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>
			</button>

			{menuOpen && portalTarget && ReactDOM.createPortal(
				<div 
					ref={menuRef}
					className={styles.dropdown}
					role="menu"
					aria-hidden="false"
				>
					<div className={styles.dropdownContent}>
						
						{/* Filter Section */}
						<div className={styles.section}>
							<div className={styles.sectionHeader}>
								<span className={styles.sectionIcon}>🏷️</span>
								<h3 className={styles.sectionTitle}>Filter</h3>
							</div>
							<div className={styles.buttonGrid}>
								{taxonomy.map((item) => {
									const icons = { all: '🌐', read: '📖', play: '🎮', about: 'ℹ️' };
									return (
										<button
											key={item}
											className={`${styles.filterButton} ${activeType === item ? styles.active : ''}`}
											onClick={() => handleType(item)}
											aria-current={activeType === item ? "page" : undefined}
										>
											<span className={styles.buttonIcon}>{icons[item] || '🌐'}</span>
											<span className={styles.buttonLabel}>{item.toUpperCase()}</span>
										</button>
									);
								})}
							</div>
						</div>

						{/* Sort Section */}
						<div className={styles.section}>
							<div className={styles.sectionHeader}>
								<span className={styles.sectionIcon}>⚡</span>
								<h3 className={styles.sectionTitle}>Sort</h3>
							</div>
							<div className={styles.sortControls}>
								<div className={styles.sortButtons}>
									{SORT_OPTIONS.map((opt) => (
										<button
											key={opt.key}
											disabled={isDetailView}
											className={`${styles.sortButton} ${activeSort === opt.key ? styles.active : ''}`}
											onClick={() => !isDetailView && handleSort(opt.key)}
										>
											<span className={styles.buttonIcon}>{opt.icon}</span>
											<span className={styles.buttonLabel}>{opt.label}</span>
										</button>
									))}
								</div>
								{activeSort !== 'alpha' && (
									<div className={styles.orderControls}>
										<button
											disabled={isDetailView}
											className={`${styles.orderButton} ${activeOrder === 'desc' ? styles.active : ''}`}
											onClick={() => !isDetailView && handleOrder('desc')}
											title="Newest first"
										>
											<span className={styles.orderIcon}>↓</span>
											<span className={styles.orderLabel}>New</span>
										</button>
										<button
											disabled={isDetailView}
											className={`${styles.orderButton} ${activeOrder === 'asc' ? styles.active : ''}`}
											onClick={() => !isDetailView && handleOrder('asc')}
											title="Oldest first"
										>
											<span className={styles.orderIcon}>↑</span>
											<span className={styles.orderLabel}>Old</span>
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Theme Section */}
						<div className={styles.section}>
							<div className={styles.sectionHeader}>
								<span className={styles.sectionIcon}>🎨</span>
								<h3 className={styles.sectionTitle}>Theme</h3>
							</div>
							<div className={styles.themeControls}>
								{children}
							</div>
						</div>

					</div>
				</div>,
				portalTarget
			)}
		</div>
	);
}
