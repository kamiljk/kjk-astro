import type { APIRoute } from 'astro';
import { getEntryBySlug } from 'astro:content';

// Tell Astro not to pre-render this route at build time.
// It should run on the server when requested.
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug parameter is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const entry = await getEntryBySlug('posts', slug);

    if (!entry) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return frontmatter and the raw Markdown body
    return new Response(
      JSON.stringify({
        frontmatter: entry.data,
        body: entry.body, // Return the raw Markdown body
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
