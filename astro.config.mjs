// @ts-check
import { defineConfig } from "astro/config";

import remarkWikiLink from "remark-wiki-link";

import vercel from "@astrojs/vercel";

import astroPagefind from "astro-pagefind";

import svelte from '@astrojs/svelte';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Removed build.assets: "." to use default asset output (dist/assets/)

  integrations: [
    astroPagefind(),
    svelte(),
    react(),
  ],

  markdown: {
    remarkPlugins: [
      [remarkWikiLink, {
        hrefTemplate: (permalink) => {
          // Convert spaces to dashes, lowercase, and point to /posts/ by default
          const slug = permalink.replace(/\s+/g, '-').toLowerCase();
          return `/posts/${slug}/`;
        },
        pageResolver: (name) => [name],
        aliasDivider: '|',
      }]
    ]
  },

  adapter: vercel()
});