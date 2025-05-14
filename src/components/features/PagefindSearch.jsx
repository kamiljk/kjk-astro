import React, { useEffect, useRef, useState } from "react";

export default function PagefindSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagefind, setPagefind] = useState(null);
  const inputRef = useRef(null);

  // Dynamically load Pagefind
  useEffect(() => {
    let cancelled = false;
    if (!window.Pagefind) {
      const script = document.createElement("script");
      script.src = "/pagefind/pagefind.js";
      script.async = true;
      script.onload = () => {
        if (!cancelled && window.Pagefind) setPagefind(window.Pagefind);
      };
      document.body.appendChild(script);
      return () => {
        cancelled = true;
        document.body.removeChild(script);
      };
    } else {
      setPagefind(window.Pagefind);
    }
  }, []);

  // Perform search
  useEffect(() => {
    if (!pagefind || !query) {
      setResults([]);
      return;
    }
    setLoading(true);
    pagefind.search(query).then((res) => {
      if (!res || !res.results) {
        setResults([]);
        setLoading(false);
        return;
      }
      Promise.all(res.results.slice(0, 10).map((r) => r.data())).then((data) => {
        setResults(data);
        setLoading(false);
      });
    });
  }, [query, pagefind]);

  return (
    <div className="pagefind-search-island">
      <input
        ref={inputRef}
        type="search"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pagefind-search-input"
        aria-label="Search site content"
      />
      {loading && <div className="pagefind-search-loading">Searching...</div>}
      <ul className="pagefind-search-results">
        {results.map((r, i) => (
          <li key={r.url || i} className="pagefind-search-result-item">
            <a href={r.url} className="pagefind-search-result-link">{r.meta?.title || r.url}</a>
            {r.excerpt && (
              <div className="pagefind-search-result-excerpt" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            )}
          </li>
        ))}
      </ul>
      {query && !loading && results.length === 0 && (
        <div className="pagefind-search-no-results">No results found.</div>
      )}
    </div>
  );
}
