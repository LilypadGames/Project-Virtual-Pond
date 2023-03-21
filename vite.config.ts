import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "./dist",
	},
	root: "./client",
	plugins: [],
	server: { open: "index.html", host: "0.0.0.0", port: 8000 },
	clearScreen: false,
});
