import { useEffect, useState, useRef } from "react";
import { normalizeType } from "../../utils/normalizeType.js";
import styles from "./Feed.module.css";
import UnifiedButton from "../common/UnifiedButton.jsx";

export default function Feed({ type: initialType = "all", sort: initialSort = "activity", order: initialOrder = "desc" } = {}) {
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
    if (s === "newest") s = "activity"; // Map legacy 'newest' to new unified timeline
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
      if (type === "all") return allowedTypes.includes(norm) || post.data?.priority === "urgent";
      return norm === type || post.data?.priority === "urgent";
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
      console.log('[Feed.jsx] Fetched data:', data);
      console.log('[Feed.jsx] First post data:', data.posts[0]?.data);
      console.log('[Feed.jsx] Thumbnail check for first 3 posts:');
      data.posts.slice(0, 3).forEach((post, idx) => {
        console.log(`  Post ${idx}: slug=${post.slug}, thumbnailSrc="${post.data?.thumbnailSrc}", hasThumb=${Boolean(post.data?.thumbnailSrc && post.data?.thumbnailSrc !== "null" && post.data?.thumbnailSrc !== "undefined")}`);
      });
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
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Helper: is date recent (within 2 months)
  function isRecent(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDay = diffMs / (1000 * 60 * 60 * 24);
    return diffDay < 62; // ~2 months
  }

  // Helper: elegant date display prioritizing most relevant date
  function elegantDateDisplay(dateCreated, dateUpdated) {
    if (!dateCreated && !dateUpdated) return null;
    
    // If no update or same date, show created date as simple text
    if (!dateUpdated || dateCreated === dateUpdated) {
      const displayDate = isRecent(dateCreated) ? fuzzyDate(dateCreated) : calendarDate(dateCreated);
      return (
        <span style={{ 
          fontSize: '0.85em', 
          fontWeight: '400', 
          color: 'rgba(var(--color-text-rgb, 24, 28, 23), 0.7)' 
        }}>
          {displayDate}
        </span>
      );
    }
    
    // For posts with updates, show chronological timeline: newest ← span → oldest
    const createdRecent = isRecent(dateCreated);
    const updatedRecent = isRecent(dateUpdated);
    
    // Calculate time span between dates
    const createdDate = new Date(dateCreated);
    const updatedDate = new Date(dateUpdated);
    const diffMs = updatedDate.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    let span = "";
    if (diffYears >= 1) {
      span = `${diffYears}y`;
    } else if (diffMonths >= 1) {
      span = `${diffMonths}mo`;
    } else if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      span = `${weeks}w`;
    } else {
      span = `${diffDays}d`;
    }
    
    // Format dates for display
    const newestDate = updatedRecent ? fuzzyDate(dateUpdated) : calendarDate(dateUpdated);
    const oldestDate = calendarDate(dateCreated);
    
    // Clean, simple display: prioritize the most relevant information
    return (
      <span className="post-date-timeline">
        <span className="post-date-primary">{newestDate}</span>
        <span className="post-date-context">({span})</span>
      </span>
    );
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
                <li className={styles["urgent-post"]}>
                    No posts loaded
                </li>
            )}
            {posts.map((post, idx) => {
                const slug = post.slug || post.data?.slug;
                const title = post.data?.title || post.title || post.slug || post.data?.name || "Untitled Post";
                const isUrgent = post.data?.priority === "urgent";
                const href = `/posts/${slug}/`;
                const dateCreated = post.data?.dateCreated;
                const dateUpdated = post.data?.dateUpdated;
                const description = post.data?.description;
                const thumbnail = post.data?.thumbnailSrc;
                const hasThumb = Boolean(thumbnail && thumbnail !== "null" && thumbnail !== "undefined");
                const postType = normalizeType(post.data?.type);
                
                console.log(`[Feed.jsx] Post ${slug}:`, {
                    thumbnail: thumbnail,
                    hasThumb: hasThumb,
                    postType: postType,
                    postData: post.data
                });
                
                // Generate placeholder content based on post type
                const getPlaceholderContent = () => {
                    switch(postType) {
                        case "play":
                        case "game":
                            return "🎮";
                        case "read":
                            return "📚";
                        case "post":
                            return "📝";
                        case "about":
                            return "ℹ️";
                        default:
                            return "📄";
                    }
                };

                return (
                    <li
                        key={slug || idx}
                        data-type={postType || ""}
                        className={`${styles["post-card"]} ${isUrgent ? styles["urgent-post"] : ""}`}
                    >
                        <div className={`${styles["post-card-inner"]} ${styles["with-thumbnail"]}`}>
                            <div className={styles["post-card-content"]}>
                                <a
                                    href={slug ? `/posts/${slug}/` : "#"}
                                    className={`${styles["post-title"]} ${isUrgent ? styles["urgent"] : ""}`}
                                >
                                    {isUrgent ? `⚠️ ${title}` : title}
                                </a>
                                <div className={styles["post-date"]} title={
                                    dateUpdated && dateUpdated !== dateCreated ? 
                                        `Updated ${calendarDate(dateUpdated)} → originally created ${calendarDate(dateCreated)}` :
                                        `Created: ${calendarDate(dateCreated)}`
                                }>
                                    {elegantDateDisplay(dateCreated, dateUpdated)}
                                </div>
                                {description && (
                                    <div className={styles["post-description"]}>
                                        {description}
                                    </div>
                                )}
                            </div>
                            <div className={styles["post-card-thumbnail"]}>
                                {hasThumb ? (
                                    <img
                                        src={thumbnail}
                                        alt={`Thumbnail for ${title}`}
                                        className={styles["post-thumb-large"]}
                                        loading="lazy"
                                        onError={(e) => {
                                            // On error, show placeholder instead
                                            e.target.style.display = "none";
                                            const placeholder = e.target.parentElement.querySelector('.thumbnail-placeholder');
                                            if (placeholder) placeholder.style.display = 'flex';
                                        }}
                                        onLoad={(e) => {
                                            e.target.parentElement.classList.remove("loading");
                                        }}
                                    />
                                ) : null}
                                <div 
                                    className={`${styles["thumbnail-placeholder"]} ${hasThumb ? styles["hidden"] : ""}`}
                                    style={{ 
                                        display: hasThumb ? 'none' : 'flex'
                                    }}
                                >
                                    <span className={styles["placeholder-icon"]}>
                                        {getPlaceholderContent()}
                                    </span>
                                    <span className={styles["placeholder-text"]}>
                                        {postType || 'post'}
                                    </span>
                                </div>
                            </div>
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
