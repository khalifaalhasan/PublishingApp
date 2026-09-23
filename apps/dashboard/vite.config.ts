import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "path";

const componentsLib = path.resolve("../../packages/components/src/lib");

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      adapter: adapter(),
    }),
    // Resolve $lib references inside packages/components when consumed from dashboard
    {
      name: "resolve-components-lib",
      resolveId(id, importer) {
        if (
          id.startsWith("$lib/") &&
          importer?.includes("packages/components")
        ) {
          return path.resolve(componentsLib, id.replace("$lib/", ""));
        }
        if (id === "$lib" && importer?.includes("packages/components")) {
          return componentsLib + "/index.ts";
        }
      },
    },
  ],
  resolve: {
    alias: {
      // Expose packages/components/src/lib as $components in dashboard
      $components: componentsLib,
    },
  },
  server: {
    port: 5173,
  },
});
