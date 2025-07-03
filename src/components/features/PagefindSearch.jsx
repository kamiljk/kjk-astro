import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

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
            script.src = "/pagefind.js"; // Reverted to previous path
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
            <div
                className="search-results-container"
                ref={containerRef}
            ></div>

            {isClient && portalTarget && isSearchOpen && searchResults.length > 0 && ReactDOM.createPortal(
                <div
                    id="search-results-dropdown"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        background: 'var(--frosted-bg)',
                        backdropFilter: 'var(--frosted-blur)',
                        border: 'var(--frosted-border)',
                        boxShadow: 'var(--shadow-elevation-3)',
                        zIndex: 100,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        borderRadius: '0 0 var(--radius-unified) var(--radius-unified)',
                        padding: 'var(--fluid-space-s)',
                    }}
                >
                    <div style={{ marginBottom: 'var(--fluid-space-xs)', fontSize: '0.875rem', color: 'var(--color-desc)', fontWeight: '500' }}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchValue}"
                    </div>
                    {searchResults.map((result) => (
                        <a
                            key={result.id}
                            href={result.url}
                            style={{
                                display: 'block',
                                padding: 'var(--fluid-space-xs)',
                                marginBottom: 'var(--fluid-space-xs)',
                                borderRadius: 'var(--radius-unified)',
                                textDecoration: 'none',
                                color: 'var(--color-text)',
                                background: 'transparent',
                                transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                        >
                            <div style={{ fontWeight: '600', marginBottom: 'var(--fluid-space-2xs)', fontSize: '0.95rem' }}>
                                {result.meta.title}
                            </div>
                            {result.meta.excerpt && (
                                <div style={{ color: 'var(--color-desc)', fontSize: '0.875rem', lineHeight: '1.4' }}>
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
