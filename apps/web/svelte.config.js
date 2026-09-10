/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		alias: {
			'@repo/ui': '../../packages/ui/src/lib/index.ts'
		}
	}
};
