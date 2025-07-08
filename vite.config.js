import { defineConfig } from "vite";
import astro from "@astrojs/vite-plugin-astro";

export default defineConfig({
	plugins: [astro()],
	server: {
		open: true,
	},
	build: {
		outDir: "dist",
	},
	publicDir: "public",
});
