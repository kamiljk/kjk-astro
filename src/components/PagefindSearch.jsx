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
    <div className="pagefind-search-island" style={{ maxWidth: 500, margin: "2em auto" }}>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: "100%", padding: "0.5em", fontSize: "1.1em" }}
        aria-label="Search site content"
      />
      {loading && <div style={{ color: "#888", marginTop: 8 }}>Searching...</div>}
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {results.map((r, i) => (
          <li key={r.url || i} style={{ marginBottom: 12 }}>
            <a href={r.url} style={{ fontWeight: 600 }}>{r.meta?.title || r.url}</a>
            {r.excerpt && (
              <div style={{ color: "#666", fontSize: "0.95em", marginTop: 2 }} dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            )}
          </li>
        ))}
      </ul>
      {query && !loading && results.length === 0 && (
        <div style={{ color: "#888", marginTop: 8 }}>No results found.</div>
      )}
    </div>
  );
}
