import React, { useState, useRef, useEffect } from "react";
import styles from "./NavbarMenu.module.css";

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
	const btnRef = useRef(null);
	const menuRef = useRef(null);

	// State should reflect props from URL
	const [activeType, setActiveType] = useState(type);
	const [activeSort, setActiveSort] = useState(sort);
	const [activeOrder, setActiveOrder] = useState(order);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setIsClient(true);

			const url = new URL(window.location.href);
			setActiveType(url.searchParams.get('type') || type);
			setActiveSort(url.searchParams.get('sort') || sort);
			setActiveOrder(url.searchParams.get('order') || order);
		}
	}, [type, sort, order]);

	// URL navigation helper
	const updateUrlParams = (params) => {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.origin + '/');
		Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
		url.searchParams.set('page', '1');
		window.location.href = url.toString();
	};

	// Event handlers
	const handleType = (item) => {
		updateUrlParams({ type: item, sort: activeSort, order: activeOrder });
	};
	const handleSort = (key) => {
		const newOrder = key === 'alpha' ? 'asc' : 'desc';
		updateUrlParams({ type: activeType, sort: key, order: newOrder });
	};
	const handleOrder = (orderKey) => {
		updateUrlParams({ type: activeType, sort: activeSort, order: orderKey });
	};

	// Close menu on outside click, scroll, and Escape
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

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
		window.addEventListener('scroll', handleEscape, { passive: true });

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
			window.removeEventListener('scroll', handleEscape);
		};
	}, [menuOpen]);

	const toggleMenu = (e) => {
		e.stopPropagation();
		setMenuOpen(!menuOpen);
	};

	const isDetailView = isClient && typeof window !== 'undefined' && window.location.pathname !== '/';

	return (
		<>
			<button
				ref={btnRef}
				onClick={toggleMenu}
				aria-expanded={menuOpen}
				aria-label="Open menu"
				aria-controls="filter-sort-menu"
				className="dropdown-button pill"
				data-dropdown-trigger=""
			>
				<svg
					className={`${styles['menu-toggle-arrow']} ${menuOpen ? styles.open : ''}`}
					width="24"
					height="24"
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

			{isClient && (
				<div
					ref={menuRef}
					id="filter-sort-menu"
					className={`liquid-glass-base liquid-glass-dropdown ${menuOpen ? 'dropdown-visible' : ''}`}
					role="menu"
					hidden={!menuOpen}
					aria-hidden={!menuOpen}
					aria-expanded={menuOpen}
					tabIndex={menuOpen ? -1 : undefined}
				>
					<div className={styles['menu-content']}>
						<div className={styles['menu-section']}>
							<div className={styles['section-label']}>Filter</div>
							<div className={styles['pills-container']}>
								{taxonomy.map((item) => (
									<button
										key={item}
										className={`pill${activeType === item ? ' active' : ''}`}
										onClick={() => handleType(item)}
										aria-current={activeType === item ? "page" : undefined}
									>
										{item}
									</button>
								))}
							</div>
						</div>
						<div className={styles['menu-section']}>
							<div className={styles['section-label']}>Sort</div>
							<div className={styles['pills-container']}>
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.key}
										disabled={isDetailView}
										className={`pill${activeSort === opt.key ? ' active' : ''}`}
										onClick={() => !isDetailView && handleSort(opt.key)}
										aria-current={activeSort === opt.key ? "page" : undefined}
									>
										{opt.label}
									</button>
								))}
								{activeSort !== 'alpha' && (
									<div className={styles['sort-item']}>
										<button
											disabled={isDetailView}
											className={`pill small-pill${activeOrder === 'asc' ? ' active' : ''}`}
											onClick={() => !isDetailView && handleOrder('asc')}
											aria-label="Sort ascending"
										>
											↑
										</button>
										<button
											disabled={isDetailView}
											className={`pill small-pill${activeOrder === 'desc' ? ' active' : ''}`}
											onClick={() => !isDetailView && handleOrder('desc')}
											aria-label="Sort descending"
										>
											↓
										</button>
									</div>
								)}
							</div>
						</div>
						<div className={styles['menu-section']}>
							<div className={styles['section-label']}>Mode</div>
							{children}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
