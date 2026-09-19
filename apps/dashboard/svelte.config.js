/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    files: {
      lib: "src/lib",
    },
    adapter: adapter({
      out: "build",
    }),
    // alias: {
    //   "@repo/ui": "../../packages/ui/src/lib/index.ts",
    // },
  },
};
