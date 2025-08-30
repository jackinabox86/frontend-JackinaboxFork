import path from "path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

const alias = { "@": path.resolve(__dirname, "./src") };

export default defineConfig({
	define: {
		__INDEXEDDB_VERSION__: Date.now(), // force db upgrade each test run
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
	},
	test: {
		setupFiles: "./src/tests/vitest.setup.ts",
		globals: true,
		env: loadEnv("", ""),
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/coverage/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
		],
		environment: "jsdom",
		coverage: {
			enabled: true,
			provider: "v8",
			reporter: [["lcov", { projectRoot: "./src" }], ["html"]],
			include: ["src/**"],
			exclude: [
				"src/layout/*",
				"src/AppProvider.vue",
				"src/App.vue",
				"src/main.ts",
				"src/views/*",
				"**/components/**",
				"**/dist/**",
				"src/tests/**",
				"**/queryRepository.ts",
				"**/QueryCacheView.vue",
				"src/features/wrapper/**",
				"src/util/axiosSetup.ts",
				"src/lib/piniaBroadcastPlugin.ts",
				"src/lib/piniaBroadcastWorker.ts",
			],
			reportOnFailure: true,
		},
	},
	resolve: {
		alias,
	},
	plugins: [vue()],
});
