import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "dist",
		rollupOptions: {
			input: {
				app: "/src/page/index.html",
			},
		},
	},
	// root: "./client",
	plugins: [],
	server: { open: "/src/page/index.html", host: "0.0.0.0", port: 8000 },
	clearScreen: false,
});
