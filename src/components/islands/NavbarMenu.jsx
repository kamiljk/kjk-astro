import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);

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

  // --- URL param update helpers ---
  function updateUrlParams(params) {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("page", "1");
    window.history.pushState({}, "", url);
    window.dispatchEvent(new Event("popstate"));
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

  // Focus first pill when menu opens (for keyboard nav)
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const firstPill = menuRef.current.querySelector('.pill');
      if (firstPill) firstPill.focus();
    }
  }, [menuOpen]);

  // Set dropdown top position based on navbar height
  useEffect(() => {
    if (menuOpen && isClient) {
      const navbar = document.querySelector('.site-header');
      if (navbar) {
        const rect = navbar.getBoundingClientRect();
        setDropdownTop(rect.bottom);
      }
    }
  }, [menuOpen, isClient]);

  // Show/hide menu with animation
  useEffect(() => {
    if (menuOpen) {
      setShouldRenderMenu(true);
    }
  }, [menuOpen]);

  // Listen for transition end to unmount after ease-out
  useEffect(() => {
    if (!shouldRenderMenu) return;
    const menuEl = menuRef.current;
    if (!menuEl) return;
    function handleTransitionEnd(e) {
      if (!menuOpen && e.propertyName === 'opacity') {
        setShouldRenderMenu(false);
      }
    }
    menuEl.addEventListener('transitionend', handleTransitionEnd);
    return () => menuEl.removeEventListener('transitionend', handleTransitionEnd);
  }, [menuOpen, shouldRenderMenu]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setMenuOpen((prev) => !prev)}
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
      {isClient && shouldRenderMenu && createPortal(
        <div
          id="filter-sort-menu"
          className={`menu-container${menuOpen ? ' visible' : ''}`}
          ref={menuRef}
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "var(--feed-max-width)",
            width: "100%",
            top: dropdownTop,
            border: "1.5px solid var(--color-border, #d6d5c9)",
            borderTop: "none",
            boxShadow: "0 12px 32px -4px rgba(0,0,0,0.18), 0 1.5px 0 0 rgba(0,0,0,0.04)",
            background: "var(--color-navbar-bg, rgba(255,255,255,0.69))",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)"
          }}
          aria-hidden={menuOpen ? "false" : "true"}
          tabIndex={0}
        >
          <div className="menu-content">
            <div className="menu-section filter-section">
              {taxonomy.map((item) => (
                <button
                  key={item}
                  className={`pill${activeType === item ? " active" : ""}`}
                  onClick={() => handleType(item)}
                  aria-current={activeType === item ? "page" : undefined}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="menu-section sort-section" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {SORT_OPTIONS.map((opt) => (
                <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <button
                    className={`pill${activeSort === opt.key ? " active" : ""}`}
                    onClick={() => handleSort(opt.key)}
                    aria-current={activeSort === opt.key ? "page" : undefined}
                  >
                    {opt.label}
                  </button>
                  {/* Show order arrows for non-alpha sorts */}
                  {activeSort === opt.key && opt.key !== 'alpha' && (
                    <span className="sort-arrows">
                      <button
                        className={`sort-arrow${activeOrder === 'asc' ? ' active' : ''}`}
                        aria-label="Sort ascending"
                        onClick={() => handleOrder('asc')}
                        tabIndex={0}
                        type="button"
                      >
                        ▲
                      </button>
                      <button
                        className={`sort-arrow${activeOrder === 'desc' ? ' active' : ''}`}
                        aria-label="Sort descending"
                        onClick={() => handleOrder('desc')}
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
        document.body
      )}
    </>
  );
}
