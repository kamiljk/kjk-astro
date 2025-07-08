import { useEffect, useState, useRef } from "react";
import { normalizeType } from "../../utils/normalizeType.js";
import styles from "./Feed.module.css";

export default function FeedWithLayout({ 
  type: initialType = "all", 
  sort: initialSort = "activity", 
  order: initialOrder = "desc",
  layout = "default", // new prop for layout variations
  cardSize = "default" // new prop for card size variations
} = {}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Only allow these types
  const allowedTypes = ["about", "play", "read", "post"];

  // Helper to normalize sort/order for API and UI consistency
  function normalizeSortOrder(sort, order) {
    let s = sort;
    let o = order;
    if (s === "newest") s = "activity";
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
    if (type !== "all" && !allowedTypes.includes(type)) type = "all";
    return { type, sort, order };
  }

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

  useEffect(() => {
    const { type, sort, order } = getParams(search);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    
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
  }, [initialType, initialSort, initialOrder, search]);

  // Generate layout-specific CSS classes
  const getLayoutClasses = () => {
    const baseClass = styles["posts-feed"];
    let layoutClass = "";
    
    switch(layout) {
      case "grid":
        layoutClass = "grid-layout";
        break;
      case "grid-2":
        layoutClass = "grid-2-layout";
        break;
      case "tight":
        layoutClass = "tight-layout";
        break;
      case "wide":
        layoutClass = "wide-layout";
        break;
      default:
        layoutClass = "default-layout";
    }
    
    return `${baseClass} ${layoutClass}`;
  };

  const getCardClasses = (isUrgent) => {
    const baseClass = styles["post-card"];
    const urgentClass = isUrgent ? styles["urgent-post"] : "";
    
    let sizeClass = "";
    switch(cardSize) {
      case "large":
        sizeClass = "large-card";
        break;
      case "compact":
        sizeClass = "compact-card";
        break;
      default:
        sizeClass = "default-card";
    }
    
    return `${baseClass} ${urgentClass} ${sizeClass}`.trim();
  };

  // Generate placeholder content based on post type
  const getPlaceholderContent = (postType) => {
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
    <>
      <style>{`
        .grid-layout {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)) !important;
          gap: 20px !important;
        }
        
        .grid-2-layout {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
          gap: 24px !important;
        }
        
        .tight-layout {
          gap: 12px !important;
        }
        
        .wide-layout {
          gap: 40px !important;
        }
        
        .large-card .${styles["post-card-inner"]} {
          padding: 30px !important;
        }
        
        .large-card .${styles["post-card-thumbnail"]} {
          width: 180px !important;
          height: 180px !important;
        }
        
        .large-card .${styles["post-title"]} {
          font-size: 1.3em !important;
        }
        
        .compact-card .${styles["post-card-inner"]} {
          padding: 15px !important;
        }
        
        .compact-card .${styles["post-card-thumbnail"]} {
          width: 100px !important;
          height: 100px !important;
        }
        
        .compact-card .${styles["post-title"]} {
          font-size: 1em !important;
        }
        
        .compact-card .${styles["post-description"]} {
          font-size: 0.85em !important;
        }
        
        @media (max-width: 768px) {
          .grid-layout,
          .grid-2-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      <ul id="posts-feed" className={getLayoutClasses()}>
        {posts.length === 0 && (
          <li className={styles["urgent-post"]}>
            No posts loaded
          </li>
        )}
        {posts.map((post, idx) => {
          const slug = post.slug || post.data?.slug;
          const title = post.data?.title || post.title || post.slug || post.data?.name || "Untitled Post";
          const isUrgent = post.data?.priority === "urgent";
          const description = post.data?.description;
          const thumbnail = post.data?.thumbnailSrc;
          const hasThumb = Boolean(thumbnail && thumbnail !== "null" && thumbnail !== "undefined");
          const postType = normalizeType(post.data?.type);

          return (
            <li
              key={slug || idx}
              data-type={postType || ""}
              className={getCardClasses(isUrgent)}
            >
              <div className={`${styles["post-card-inner"]} ${styles["with-thumbnail"]}`}>
                <div className={styles["post-card-content"]}>
                  <a
                    href={slug ? `/posts/${slug}/` : "#"}
                    className={`${styles["post-title"]} ${isUrgent ? styles["urgent"] : ""}`}
                  >
                    {isUrgent ? `⚠️ ${title}` : title}
                  </a>
                  <div className={styles["post-date"]}>
                    {new Date(post.data?.dateCreated || '').toLocaleDateString()}
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
                        e.target.style.display = "none";
                        const placeholder = e.target.parentElement.querySelector('.thumbnail-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
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
                      {getPlaceholderContent(postType)}
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
