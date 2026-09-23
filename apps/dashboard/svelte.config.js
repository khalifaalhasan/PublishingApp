import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      lib: "src/lib",
    },
    adapter: adapter({
      out: "build",
    }),
    alias: {
      $components: path.resolve("../../packages/components/src/lib"),
    },
  },
};

export default config;
