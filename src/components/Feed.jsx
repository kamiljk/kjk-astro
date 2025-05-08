import React, { useEffect, useState, useRef, useCallback } from "react";

export default function Feed({ type = "all", sort = "newest", order = "desc" }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const params = new URLSearchParams({ type, sort, order, page: page.toString() });
    const res = await fetch(`/api/feed.json?${params}`);
    const data = await res.json();
    setPosts((prev) => [...prev, ...(data.posts || [])]);
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

  return (
    <>
      <ul id="posts-feed" style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post, idx) => (
          <li key={post.slug || idx} data-type={post.data?.type || ""}>
            <a href={`/posts/${post.slug}/`}>
              {post.data?.title || post.title || post.slug || post.name}
            </a>
            {post.data?.description && (
              <div className="post-description" style={{ color: "#aaa", fontSize: "1.05em", marginTop: "0.25em" }}>
                {post.data.description}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div ref={loaderRef} style={{ textAlign: "center", margin: "2em 0", color: "#888" }}>
        {loading ? "Loading..." : !hasMore ? "No more posts." : null}
      </div>
    </>
  );
}
