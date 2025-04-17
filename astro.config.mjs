// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

import remarkGfm from 'remark-gfm';
import wiki from 'remark-wiki-link';

// simple slugify: lowercase, spaces-> hyphens, remove invalid chars
const slugify = str => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react()],
  markdown: {
    remarkPlugins: [
      remarkGfm,
      [wiki, {
        // resolve wiki link names to lowercase-hyphen file paths
        pageResolver: name => [`src/pages/posts/${slugify(name)}.md`],
        // generate URLs in same slug style for both site and obsidian
        hrefTemplate: filePath => `/posts/${slugify(filePath.split('/').pop().replace(/\.md$/, ''))}`
      }]
    ]
  }
});