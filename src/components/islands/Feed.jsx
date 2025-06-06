import { useEffect, useState, useRef } from "react";
import { normalizeType } from "../../utils/normalizeType.js";
import styles from "./Feed.module.css";

export default function Feed({ type: initialType = "all", sort: initialSort = "newest", order: initialOrder = "desc" } = {}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [expandedContent, setExpandedContent] = useState(null);
  const loaderRef = useRef(null);

  // Only allow these types
  const allowedTypes = ["about", "play", "read", "post"];

  // Helper to normalize sort/order for API and UI consistency
  function normalizeSortOrder(sort, order) {
    let s = sort;
    let o = order;
    if (s === "newest") s = "created";
    if (s === "alpha") o = "asc";
    else if (!o) o = "desc";
    return { sort: s, order: o };
  }

  // Track current params from URL or props, always normalize
  function getParams(search) {
    let type = initialType;
    let sort = initialSort;
    let order = initialOrder;
    if (search) {
      const urlParams = new URLSearchParams(search);
      type = urlParams.get("type") || initialType;
      sort = urlParams.get("sort") || initialSort;
      order = urlParams.get("order") || initialOrder;
    }
    ({ sort, order } = normalizeSortOrder(sort, order));
    // Always coerce type to allowedTypes or 'all'
    if (type !== "all" && !allowedTypes.includes(type)) type = "all";
    return { type, sort, order };
  }

  // Track the current search string in state (so we can update on popstate/pushstate)
  const [search, setSearch] = useState(() => (typeof window !== "undefined" ? window.location.search : ""));

  // Robust filter for posts
  function filterPosts(posts, type) {
    return (posts || []).filter(post => {
      const rawType = post.data?.type;
      const norm = normalizeType(rawType);
      if (!norm) return false;
      if (type === "all") return allowedTypes.includes(norm);
      return norm === type;
    });
  }

  // Always reset feed when params change (type/sort/order)
  useEffect(() => {
    const { type, sort, order } = getParams(search);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    // Fetch first page immediately
    const fetchInitial = async () => {
      setLoading(true);
      const params = new URLSearchParams({ type, sort, order, page: "1" });
      const url = `/api/feed.json?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(filterPosts(data.posts, type));
      setHasMore(data.hasMore);
      setLoading(false);
    };
    fetchInitial();
    // eslint-disable-next-line
  }, [initialType, initialSort, initialOrder, search]);

  // Fetch more posts when page increments (but not on first load)
  useEffect(() => {
    if (page === 1) return;
    const { type, sort, order } = getParams(search);
    const fetchMore = async () => {
      setLoading(true);
      const params = new URLSearchParams({ type, sort, order, page: page.toString() });
      const url = `/api/feed.json?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(prev => [...prev, ...filterPosts(data.posts, type)]);
      setHasMore(data.hasMore);
      setLoading(false);
    };
    fetchMore();
    // eslint-disable-next-line
  }, [page, search]);

  // Reset feed and update search when URL params change
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        setSearch(window.location.search);
      }
      setPosts([]);
      setPage(1);
      setHasMore(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", handlePopState);
      // Monkey-patch pushState to emit an event
      const origPushState = window.history.pushState;
      window.history.pushState = function (...args) {
        origPushState.apply(this, args);
        window.dispatchEvent(new Event("pushstate"));
      };
      window.addEventListener("pushstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("pushstate", handlePopState);
        window.history.pushState = origPushState;
      };
    }
  }, []);

  // Infinite scroll observer (robust, only increments page when not loading and hasMore)
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  // Helper: fuzzy date formatting
  function fuzzyDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffMonth = now.getMonth() - date.getMonth() + 12 * (now.getFullYear() - date.getFullYear());
    const diffYear = now.getFullYear() - date.getFullYear();

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    if (diffDay < 31) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) === 1 ? '' : 's'} ago`;
    if (diffMonth < 12) return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    return diffYear === 1 ? 'last year' : `${diffYear} years ago`;
  }

  // Helper: calendar date formatting (short)
  function calendarDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  }

  // Helper: is date recent (within 2 months)
  function isRecent(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date)) return false;
    const now = new Date();
    const diffMs = now - date;
    const diffDay = diffMs / (1000 * 60 * 60 * 24);
    return diffDay < 62; // ~2 months
  }

  // Helper: elegant date range display (never mix fuzzy and calendar, always align)
  function elegantDateRange(start, end) {
    if (!start && !end) return null;
    if (start && !end) return isRecent(start) ? fuzzyDate(start) : calendarDate(start);
    if (!start && end) return isRecent(end) ? fuzzyDate(end) : calendarDate(end);
    if (start === end) return isRecent(start) ? fuzzyDate(start) : calendarDate(start);

    const startRecent = isRecent(start);
    const endRecent = isRecent(end);

    // Both recent: show both fuzzy
    if (startRecent && endRecent) {
      return `${fuzzyDate(start)} – ${fuzzyDate(end)}`;
    }
    // Both old: show both calendar
    if (!startRecent && !endRecent) {
      return `${calendarDate(start)} – ${calendarDate(end)}`;
    }
    // If one is recent and one is old, show only the recent end (aligned)
    if (!startRecent && endRecent) {
      return fuzzyDate(end); // Only show the recent end
    }
    if (startRecent && !endRecent) {
      return calendarDate(end); // Only show the old end (shouldn't happen, but fallback)
    }
    return null;
  }

  // Helper to fetch rendered HTML for a post
  const fetchPostHtml = async (slug) => {
    const res = await fetch(`/posts/${slug}/`);
    const html = await res.text();
    // Extract the <article>...</article> content
    const match = html.match(/<article[\s\S]*?<\/article>/);
    return match ? match[0] : null;
  };

  const handleExpand = async (slug) => {
    if (expandedSlug === slug) {
      setExpandedSlug(null);
      setExpandedContent(null);
      return;
    }
    setExpandedSlug(slug);
    const html = await fetchPostHtml(slug);
    setExpandedContent(html);
  };

  // In the render, always use normalizeType for data-type
  return (
    <>
      <ul id="posts-feed" className={styles["posts-feed"]}>
        {posts.length === 0 && (
          <li style={{color: 'red', fontWeight: 'bold'}}>
            No posts loaded
          </li>
        )}
        {posts.map((post, idx) => {
          const slug = post.slug || post.data?.slug;
          const title = post.data?.title || post.title || post.slug || post.data?.name || 'Untitled Post';
          const isGame = normalizeType(post.data?.type) === "play";
          const href = `/posts/${slug}/`;
          const gameHref = isGame ? (post.data?.link || `/games/${slug}/index.html`) : null;
          const dateCreated = post.data?.dateCreated;
          const dateUpdated = post.data?.dateUpdated;
          const description = post.data?.description;
          const thumbnail = (post.data?.type === "game" || post.data?.type === "play") ? `/games/${slug || post.data?.name}/thumbnail.png` : post.data?.thumbnailSrc;
          const showThumb = Boolean(thumbnail);
          const readCta = "READ";
          const playCtas = ["EXPERIENCE", "EXPLORE", "INTERACT", "PLAY NOW", "DISCOVER", "ENGAGE", "TRY IT", "DIVE IN", "LAUNCH", "IMMERSE"];
          const dynamicPlayCTA = playCtas[(slug?.length || idx) % playCtas.length];
          let dateDisplay = null;
          if (dateCreated && dateUpdated) {
            dateDisplay = elegantDateRange(dateCreated, dateUpdated);
          } else if (dateCreated) {
            dateDisplay = isRecent(dateCreated) ? fuzzyDate(dateCreated) : calendarDate(dateCreated);
          } else if (dateUpdated) {
            dateDisplay = isRecent(dateUpdated) ? fuzzyDate(dateUpdated) : calendarDate(dateUpdated);
          }
          return (
            <li
              key={slug || idx}
              data-type={normalizeType(post.data?.type) || ""}
              className={styles["post-card"]}
            >
              {/* Warn if slug is missing */}
              {!slug && (
                <div style={{color: 'red', fontWeight: 'bold'}}>Warning: Missing slug for post: {JSON.stringify(post)}</div>
              )}
              <div className={styles["post-card-inner"]}>
                <div className={styles["post-card-content"]}>
                  <a
                    href={slug ? `/posts/${slug}/` : '#'}
                    data-testid="feed-post-link"
                    style={{ fontSize: "1.15em", fontWeight: 600, color: "var(--color-text)", textDecoration: "none", wordBreak: "break-word" }}
                  >
                    {title}
                  </a>
                  <div style={{ fontSize: '0.95em', color: '#888', margin: '0.2em 0 0.5em 0', minHeight: '1.2em' }}>{dateDisplay || ''}</div>
                  {description && (
                    <div className={styles["post-description"]} style={{ marginBottom: '0.5em' }}>
                      {description}
                    </div>
                  )}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75em' }}>
                    <a
                      className={`${styles["feed-cta"]} ${styles["pill"]} read`}
                      data-testid="feed-cta-link"
                      style={{ marginRight: isGame ? '0.5em' : 0, display: 'inline-block', textDecoration: 'none', cursor: 'pointer' }}
                      href={slug ? `/posts/${slug}/` : undefined}
                      tabIndex={slug ? 0 : -1}
                      aria-label={slug ? `Open post: ${title}` : undefined}
                    >
                      {readCta}
                    </a>
                    {isGame && (
                      <button
                        className={`${styles["feed-cta"]} ${styles["feed-cta-play"]} ${styles["pill"]}`}
                        onClick={e => { e.preventDefault(); window.location.assign(`/games/${slug}/index.html`); }}
                      >
                        {dynamicPlayCTA}
                      </button>
                    )}
                  </div>
                </div>
                {showThumb && (
                  <div className={styles["post-card-thumbnail"]}>
                    <img
                      src={thumbnail}
                      alt={`Thumbnail for ${title}`}
                      className={styles["post-thumb-large"]}
                      loading="lazy"
                      onError={e => (e.target.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div ref={loaderRef} id="feed-loader" className={styles["feed-loader"]}>
        {loading ? "Loading..." : !hasMore ? "No more posts." : null}
      </div>
    </>
  );
}
