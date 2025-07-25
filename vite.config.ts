import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "pdf-partizione",
			fileName: "pdf-partizione",
			formats: ["es", "system"],
		},
		rollupOptions: {
			external: [
				"pdf-lib",
				"chalk",
				"log-symbols",
				"ora",
				"minimist",
				"cli-spinners",
				"@inquirer/prompts",
				"node:fs",
				"node:path",
				"node:url",
			],
		},
	},
});
