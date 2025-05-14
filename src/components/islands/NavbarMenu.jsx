import React, { useRef, useState, useEffect } from "react";
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
  const [activeType, setActiveType] = useState(type);
  const [activeSort, setActiveSort] = useState(sort);
  const [activeOrder, setActiveOrder] = useState(order);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Ensure menu visibility is toggled correctly
  useEffect(() => {
    if (typeof document !== "undefined") {
      const menuContainer = document.getElementById("filter-sort-menu");
      if (menuContainer) {
        menuContainer.setAttribute("aria-hidden", !menuOpen);
        menuContainer.tabIndex = menuOpen ? 0 : -1;
        if (menuOpen) {
          menuContainer.classList.add("visible");
        } else {
          menuContainer.classList.remove("visible");
        }
      }
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

  // --- URL param update helpers ---
  function updateUrlParam(param, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    // Always reset page to 1 on filter/sort change
    url.searchParams.set("page", "1");
    window.history.pushState({}, "", url);
    window.dispatchEvent(new Event("popstate")); // Astro reloads on popstate
  }

  const handleType = (item) => {
    updateUrlParam("type", item);
  };
  const handleSort = (key) => {
    updateUrlParam("sort", key);
    updateUrlParam("order", key === "alpha" ? "asc" : "desc");
  };
  const handleOrder = (order) => {
    updateUrlParam("order", order);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
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
      {isClient && createPortal(
        <div
          id="filter-sort-menu"
          className={`menu-container${menuOpen ? " visible" : ""}`}
          ref={menuRef}
          style={{
            position: "fixed",
            zIndex: 2000,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "826px",
            width: "100%",
            top: dropdownTop
          }}
          aria-hidden={!menuOpen}
          tabIndex={menuOpen ? 0 : -1}
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
                  {activeSort === opt.key && (
                    <div style={{ display: 'flex', gap: '0.1rem' }}>
                      {ORDER_OPTIONS.map((orderOpt) => (
                        <button
                          key={orderOpt.key}
                          className={`pill${activeOrder === orderOpt.key ? " active" : ""}`}
                          onClick={() => handleOrder(orderOpt.key)}
                          aria-current={activeOrder === orderOpt.key ? "true" : undefined}
                          style={{ fontSize: '1.1em', padding: '0 0.5em' }}
                        >
                          {orderOpt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="menu-section theme-toggle-section">
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
