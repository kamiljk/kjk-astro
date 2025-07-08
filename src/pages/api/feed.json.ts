import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { normalizeType } from "../../utils/normalizeType.js";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type') || 'all';
  const sort = url.searchParams.get('sort') || 'activity'; // Changed default to unified timeline
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const PAGE_SIZE = 9;

  let allPosts = (await getCollection('posts')).filter(post => post.data.show === true);
  const allowedTypes = ["about", "play", "read", "post"];
  if (type === 'all') {
    allPosts = allPosts.filter(post => {
      const norm = normalizeType(post.data.type);
      return norm === "read" || norm === "post" || norm === "play" || norm === "about" || post.data.priority === "urgent";
    });
  } else {
    allPosts = allPosts.filter(post => normalizeType(post.data.type) === type || post.data.priority === "urgent");
  }

  console.log('[feed.json.ts] All Posts:', allPosts.map(post => post.data));
  console.log('[feed.json.ts] Thumbnail check:', allPosts.map(post => ({ 
    slug: post.slug, 
    title: post.data.title, 
    thumbnailSrc: post.data.thumbnailSrc,
    hasThumb: Boolean(post.data.thumbnailSrc)
  })));

  // Second: sorting
  let sortedPosts = allPosts.sort((a, b) => {
    if (a.data.priority === "urgent" && b.data.priority !== "urgent") return -1;
    if (b.data.priority === "urgent" && a.data.priority !== "urgent") return 1;
    
    if (sort === 'activity' || sort === 'newest' || sort === 'updated') {
      // Unified timeline: use most recent activity date (updated OR created)
      const aActivityDate = new Date(a.data.dateUpdated || a.data.dateCreated || '').getTime();
      const bActivityDate = new Date(b.data.dateUpdated || b.data.dateCreated || '').getTime();
      return bActivityDate - aActivityDate; // Most recent activity first
    } else if (sort === 'created') {
      return new Date(b.data.dateCreated || '').getTime() - new Date(a.data.dateCreated || '').getTime();
    } else if (sort === 'oldest') {
      return new Date(a.data.dateCreated || '').getTime() - new Date(b.data.dateCreated || '').getTime();
    } else if (sort === 'alpha') {
      return (a.data.title || '').localeCompare(b.data.title || '');
    }
    return 0;
  });

  // Only enable infinite feed if enough content
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginated = sortedPosts.slice(start, end);
  const hasMore = end < sortedPosts.length;

  console.log('[feed.json.ts] API called', { type, sort, page, returned: paginated.length, total: sortedPosts.length });

  return new Response(JSON.stringify({
    posts: paginated,
    hasMore
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
