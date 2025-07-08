import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./NavbarSearch.module.css";

export default function NavbarSearch() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isClient, setIsClient] = useState(false);
    const [portalTarget, setPortalTarget] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
        const target = document.querySelector("#navbar-dropdown-portal");
        if (target) {
            setPortalTarget(target);
        }
    }, []);

    useEffect(() => {
        const initPagefind = () => {
            if (window.Pagefind) {
                console.log("Pagefind initialized for navbar search.");
            } else {
                console.error("Pagefind script not loaded.");
            }
        };

        if (!window.Pagefind) {
            console.log("Loading Pagefind script...");
            const script = document.createElement("script");
            script.type = "module";
            script.src = "/_pagefind/pagefind.js";
            script.onload = initPagefind;
            script.onerror = () => console.error("Failed to load Pagefind script");
            document.head.appendChild(script);
        } else {
            initPagefind();
        }
    }, []);

    const handleSearch = async (value) => {
        const hasValue = value.trim().length > 0;
        setIsSearchOpen(hasValue);

        if (!hasValue) {
            setSearchResults([]);
        } else {
            console.log("Querying Pagefind index...");
            try {
                const results = await window.Pagefind.search(value);
                console.log("Search results fetched:", results);
                setSearchResults(results.results);
            } catch (error) {
                console.error("Failed to fetch search results:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        handleSearch(value);
    };

    const handleClear = () => {
        setSearchValue("");
        setSearchResults([]);
        setIsSearchOpen(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    // Close search on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isSearchOpen && !e.target.closest('.search-container-inline, #navbar-dropdown-portal')) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isSearchOpen]);

    return (
        <>
            <div className={styles.searchInputWrapper}>
                <svg 
                    className={styles.searchIcon}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search..."
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                {searchValue && (
                    <button
                        className={styles.clearButton}
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {isClient && portalTarget && isSearchOpen && searchResults.length > 0 && ReactDOM.createPortal(
                <div className={`liquid-glass-base liquid-glass-dropdown dropdown-visible ${styles.searchResultsDropdown}`}>
                    <div className={styles.resultCount}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchValue}"
                    </div>
                    <div className={styles.resultsContainer}>
                        {searchResults.map((result) => (
                            <a
                                key={result.id}
                                href={result.url}
                                className={styles.resultLink}
                                onClick={() => setIsSearchOpen(false)}
                            >
                                <div className={styles.resultTitle}>
                                    {result.meta.title}
                                </div>
                                {result.meta.excerpt && (
                                    <div className={styles.resultExcerpt}>
                                        {result.meta.excerpt}
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                </div>,
                portalTarget
            )}
        </>
    );
}
