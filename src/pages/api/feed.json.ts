import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { normalizeType } from "../../utils/normalizeType.js";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type') || 'all';
  const sort = url.searchParams.get('sort') || 'newest';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const PAGE_SIZE = 9;

  let allPosts = (await getCollection('posts')).filter(post => post.data.show === true);
  if (type !== 'all') {
    allPosts = allPosts.filter(post => normalizeType(post.data.type) === type);
  }

  // Second: sorting
  let sortedPosts = allPosts;
  if (sort === 'created' || sort === 'newest') {
    sortedPosts = allPosts.sort((a, b) => new Date(b.data.dateCreated || '').getTime() - new Date(a.data.dateCreated || '').getTime());
  } else if (sort === 'updated') {
    sortedPosts = allPosts.sort((a, b) => new Date(b.data.dateUpdated || b.data.dateCreated || '').getTime() - new Date(a.data.dateUpdated || a.data.dateCreated || '').getTime());
  } else if (sort === 'oldest') {
    sortedPosts = allPosts.sort((a, b) => new Date(a.data.dateCreated || '').getTime() - new Date(b.data.dateCreated || '').getTime());
  } else if (sort === 'alpha') {
    sortedPosts = allPosts.sort((a, b) => (a.data.title || '').localeCompare(b.data.title || ''));
  }

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
