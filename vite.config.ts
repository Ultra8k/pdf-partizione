import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: true,
    outDir: resolve(__dirname, "./PdfPartizione"),
    rolldownOptions: {
      input: resolve(__dirname, "src/index.ts"),
      output: {
        format: "esm",
        codeSplitting: {
          groups: [
            {
              name: "vender",
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
});
