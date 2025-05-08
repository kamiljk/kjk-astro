import React, { useRef, useState, useEffect } from "react";

const SORT_OPTIONS = [
  { key: "updated", label: "Updated" },
  { key: "created", label: "Created" },
  { key: "alpha", label: "A-Z" },
];

export default function NavbarMenu({ taxonomy = ["all", "read", "play", "about"], type = "all", sort = "updated", order = "desc", children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeType, setActiveType] = useState(type);
  const [activeSort, setActiveSort] = useState(sort);
  const [activeOrder, setActiveOrder] = useState(order);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Sync state with props on mount
  useEffect(() => {
    setActiveType(type);
    setActiveSort(sort);
    setActiveOrder(order);
  }, [type, sort, order]);

  // Close menu on outside click
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
    if (menuOpen) {
      document.body.classList.add("menu-open");
      document.addEventListener("click", handleClickOutside);
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  // Update URL and reload page (Astro SSR fallback)
  function updateQuery(newType, newSort, newOrder) {
    const params = new URLSearchParams(window.location.search);
    if (newType && newType !== "all") params.set("type", newType); else params.delete("type");
    if (newSort) params.set("sort", newSort);
    if (newOrder) params.set("order", newOrder);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", url);
    // Optionally, trigger a reload for SSR Astro
    window.location.reload();
  }

  function handleTypeClick(item) {
    setActiveType(item);
    updateQuery(item, activeSort, activeOrder);
  }
  function handleSortClick(key) {
    setActiveSort(key);
    updateQuery(activeType, key, activeOrder);
  }
  function handleOrderClick(order) {
    setActiveOrder(order);
    updateQuery(activeType, activeSort, order);
  }

  return (
    <>
      <button
        id="nav-menu-btn"
        className="nav__menu-btn"
        aria-label="Show navigation and sorting"
        aria-expanded={menuOpen}
        aria-controls="filter-sort-menu"
        type="button"
        ref={btnRef}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(v => !v);
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`toggle-icon${menuOpen ? " flipped" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div
        id="filter-sort-menu"
        className={`menu-container${menuOpen ? " visible" : ""}`}
        aria-hidden={!menuOpen}
        ref={menuRef}
      >
        <div className="menu-content">
          <div className="menu-section filter-section">
            <h2>FILTER</h2>
            <ul className="pill-list">
              {taxonomy.map(item => (
                <li key={item}>
                  <button
                    type="button"
                    className={`pill${activeType === item ? " active" : ""}`}
                    aria-current={activeType === item ? "page" : undefined}
                    onClick={() => handleTypeClick(item)}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-section sort-section nav__sort">
            <h2>SORT</h2>
            <ul className="pill-list">
              {SORT_OPTIONS.map(opt => (
                <li key={opt.key} style={{ display: "flex", alignItems: "center" }}>
                  <button
                    type="button"
                    className={`pill${activeSort === opt.key ? " active" : ""}`}
                    aria-pressed={activeSort === opt.key}
                    onClick={() => handleSortClick(opt.key)}
                  >
                    {opt.label}
                  </button>
                  <span className="sort-arrows" style={{ display: "inline-flex", flexDirection: "column", marginLeft: 4 }}>
                    <button
                      type="button"
                      aria-label="Sort ascending"
                      className={`sort-arrow${activeSort === opt.key && activeOrder === "asc" ? " active" : ""}`}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: activeSort === opt.key && activeOrder === "asc" ? "#0066cc" : undefined }}
                      onClick={() => handleOrderClick("asc")}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Sort descending"
                      className={`sort-arrow${activeSort === opt.key && activeOrder === "desc" ? " active" : ""}`}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: activeSort === opt.key && activeOrder === "desc" ? "#0066cc" : undefined }}
                      onClick={() => handleOrderClick("desc")}
                    >
                      ▼
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-section theme-toggle-section" style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
            {typeof children === 'function' ? children() : children}
          </div>
        </div>
      </div>
    </>
  );
}
