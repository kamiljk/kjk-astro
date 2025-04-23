// @ts-check
import { defineConfig } from "astro/config";

// import vercel from '@astrojs/vercel';

import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

// import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
  // adapter: vercel(),
  integrations: [react()],

  markdown: {
    // remarkPlugins: [
    //   remarkGfm
    // ]
  },

  adapter: vercel(),
});