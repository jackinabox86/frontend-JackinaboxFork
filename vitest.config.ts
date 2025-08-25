import path from "path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

const alias = { "@": path.resolve(__dirname, "./src") };

export default defineConfig({
	test: {
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
				"src/lib/piniaBroadcastChannelPlugin.ts",
			],
			reportOnFailure: true,
		},
	},
	resolve: {
		alias,
	},
	plugins: [vue()],
});
