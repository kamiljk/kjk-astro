import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./PagefindSearch.module.css";

export default function PagefindSearch() {
    const containerRef = useRef(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isClient, setIsClient] = useState(false);
    const [portalTarget, setPortalTarget] = useState(null);

    useEffect(() => {
        setIsClient(true);
        const target = document.querySelector("#navbar-dropdown-portal");
        if (target) {
            setPortalTarget(target);
        }
    }, []);

    useEffect(() => {
        const initPagefind = () => {
            if (window.Pagefind && containerRef.current) {
                console.log("Pagefind initialized.");
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

    return (
        <>
            <div ref={containerRef} className={styles.searchContainer}>
                <input
                    type="text"
                    className="pagefind-ui__search-input"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            {isClient && portalTarget && isSearchOpen && searchResults.length > 0 && ReactDOM.createPortal(
                <div
                    id="search-results-dropdown"
                    className={styles["search-results-dropdown"]}
                >
                    <div className={styles["result-count"]}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchValue}"
                    </div>
                    {searchResults.map((result) => (
                        <a
                            key={result.id}
                            href={result.url}
                            className={styles["result-link"]}
                        >
                            <div className={styles["result-title"]}>
                                {result.meta.title}
                            </div>
                            {result.meta.excerpt && (
                                <div className={styles["result-excerpt"]}>
                                    {result.meta.excerpt}
                                </div>
                            )}
                        </a>
                    ))}
                </div>,
                portalTarget
            )}
        </>
    );
}
