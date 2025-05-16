import React, { useEffect, useState, useRef, useCallback } from "react";
import { normalizeType } from "../../utils/normalizeType.js";
import styles from "./Feed.module.css";

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

export default function Feed({ type = "all", sort = "newest", order = "desc" }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Only allow these types
  const allowedTypes = ["about", "play", "read"];

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const params = new URLSearchParams({ type, sort, order, page: page.toString() });
    const res = await fetch(`/api/feed.json?${params}`);
    const data = await res.json();
    let filtered = (data.posts || []).filter(post => {
      const norm = normalizeType(post.data?.type);
      if (!norm) return false;
      if (type === "all") return allowedTypes.includes(norm);
      return norm === type;
    });
    setPosts((prev) => [...prev, ...filtered]);
    setHasMore(data.hasMore);
    setLoading(false);
  }, [type, sort, order, page, loading, hasMore]);

  // Reset feed when type/sort/order changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [type, sort, order]);

  // Load posts on mount and when page changes
  useEffect(() => {
    loadPosts();
  }, [page, loadPosts]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // In the render, always use normalizeType for data-type
  return (
    <>
      <ul id="posts-feed" className={styles["posts-feed"]}>
        {posts.length === 0 && <li style={{color: 'red', fontWeight: 'bold'}}>No posts loaded (debug)</li>}
        {posts.map((post, idx) => {
          const slug = post.slug || post.data?.slug;
          const title = post.data?.title || post.title || post.slug || post.data?.name || 'Untitled Post';
          const href = slug ? `/posts/${slug}/` : '#';
          const dateCreated = post.data?.dateCreated;
          const dateUpdated = post.data?.dateUpdated;
          const description = post.data?.description;
          const thumbnail = (post.data?.type === "game" || post.data?.type === "play") ? `/games/${slug || post.data?.name}/thumbnail.png` : post.data?.thumbnailSrc;
          const showThumb = Boolean(thumbnail);
          // Dynamic CTA logic (example)
          const ctas = ["EXPERIENCE", "EXPLORE", "INTERACT", "PLAY NOW", "DISCOVER", "ENGAGE", "TRY IT", "DIVE IN", "LAUNCH", "IMMERSE"];
          const dynamicCTA = ctas[(slug?.length || idx) % ctas.length];
          // Elegant date display (always a single line, always aligned)
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
              <div className={styles["post-card-inner"]}>
                <div className={styles["post-card-content"]}>
                  <div>
                    <a href={href} style={{ fontSize: "1.15em", fontWeight: 600, color: "#222", textDecoration: "none", wordBreak: "break-word" }}>
                      {title}
                    </a>
                    {/* Always render a date line, even if empty, for alignment */}
                    <div style={{ fontSize: '0.95em', color: '#888', margin: '0.2em 0 0.5em 0', minHeight: '1.2em' }}>{dateDisplay || ''}</div>
                    {description && (
                      <div className={styles["post-description"]} style={{ marginBottom: '0.5em' }}>
                        {description}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 'auto', fontWeight: 500, fontSize: '1em', color: '#39ff14' }}>{dynamicCTA}</div>
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
