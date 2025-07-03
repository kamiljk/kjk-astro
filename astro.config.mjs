// @ts-check
import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
	integrations: [svelte(), react(), pagefind()],

	adapter: vercel(),
});
