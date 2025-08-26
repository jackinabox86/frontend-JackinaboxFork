import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { compression } from "vite-plugin-compression2";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin } from "vite";

export function skipEmptyChunks(): Plugin {
	return {
		name: "skip-empty-chunks",
		// @ts-expect-error Rollout imported from Vite
		generateBundle(_options: unknown, bundle: OutputBundle) {
			// add linebreak
			console.log("\n");
			for (const fileName in bundle) {
				// @ts-expect-error Rollout imported from Vite
				const chunkOrAsset: OutputChunk | OutputAsset =
					bundle[fileName];

				if (chunkOrAsset.type === "chunk") {
					if (!chunkOrAsset.code.trim()) {
						delete bundle[fileName];
						console.log(
							`[skip-empty-chunks] Skipping empty chunk: ${fileName}`
						);
					}
				}
			}
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [
		vue(),
		tailwindcss(),
		tsconfigPaths(),
		AutoImport({ imports: ["vue", "vue-router", "pinia"] }),
		Components({
			resolvers: [NaiveUiResolver()],
		}),
		skipEmptyChunks(),
		compression({
			algorithms: ["gzip", "brotliCompress"],
		}),
		visualizer({
			filename: "dist/bundle-stats.html",
			template: "treemap",
			gzipSize: true,
			brotliSize: true,
			open: process.env.ANALYZE === "true",
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			vue: "vue/dist/vue.runtime.esm-bundler.js",
		},
		dedupe: ["vue"],
	},
	optimizeDeps: {
		include: ["vue", "vue-router", "pinia"],
		exclude: [],
		esbuildOptions: {
			target: "es2020",
		},
	},
	assetsInclude: ["**/*.md"],
	build: {
		target: "esnext",
		cssCodeSplit: true,
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: false,
		minify: "esbuild",
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		rollupOptions: {
			cache: false,
			watch: false,
			treeshake: {
				moduleSideEffects: true,
			},
			output: {
				entryFileNames: "assets/[name].[hash].js",
				chunkFileNames: "assets/chunks/[name].[hash].js",
				assetFileNames: "assets/[ext]/[name].[hash].[ext]",

				// manual chunking
				manualChunks(id) {
					if (id.includes("node_modules")) {
						const parts = id
							.split("node_modules/")
							.pop()!
							.split("/");

						// handle scoped packages (@vue/reactivity)
						let pkg = parts[0];
						if (pkg.startsWith("@") && parts.length > 1) {
							pkg = `${parts[0]}/${parts[1]}`;
						}

						// heavy libs as dedicated async chunks
						if (pkg === "highcharts") return "highcharts";
						if (pkg === "showdown") return "showdown";
						if (pkg === "posthog-js") return "posthog";

						return `vendor_${pkg
							.replace("@", "")
							.replace("/", "_")}`;
					}

					// group app code by feature
					if (id.includes("/views/")) return "views";
					if (id.includes("/components/")) return "components";
				},
			},
		},
	},
	envPrefix: "VITE_",
});
