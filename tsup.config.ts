import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs"],
	clean: true,
	banner: {
		js: "#!/usr/bin/env node",
	},
	outDir: "dist",
	splitting: false,
	sourcemap: false,
	minify: false,
	target: "node18",
});
