export const prerender = false;
import type { APIRoute } from 'astro';
import { getEntryBySlug } from 'astro:content';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;
  console.log(`[API] Received request for slug: ${slug}`);
  const entry = await getEntryBySlug('posts', slug);
  if (!entry) {
    console.error(`[API] Entry not found for slug: ${slug}`);
    return new Response('Not found', { status: 404 });
  }
  console.log(`[API] Found entry for slug: ${slug}`);
  const rendered = await entry.render();

  // Placeholder until we figure out how to render rendered.Content to string
  const placeholderHtml = `<p>Content for ${slug} should be rendered here.</p>`;

  return new Response(placeholderHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
};