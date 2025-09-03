<script setup lang="ts">
	import { ColorKey, SizeKey } from "@/ui/ui.types";
	import { buttonConfig } from "@/ui/styles";
	import { computed } from "vue";

	const {
		loading = false,
		disabled = false,
		size = "md",
		type = "primary",
	} = defineProps<{
		loading?: boolean;
		disabled?: boolean;
		size?: SizeKey;
		type?: ColorKey;
	}>();

	defineEmits<{
		(e: "click"): void;
	}>();

	const buttonBase = computed(() =>
		[
			buttonConfig.base,
			buttonConfig.sizes[size].base,
			buttonConfig.colors[type].base,
			buttonConfig.colors[type].hover,
			buttonConfig.colors[type].disabled,
		].join(" ")
	);
</script>

<template>
	<button
		class="pbutton"
		:class="buttonBase"
		:disabled="disabled"
		:aria-busy="loading ? 'true' : 'false'"
		@click="$emit('click')">
		<span
			v-if="loading"
			key="spinner"
			:class="buttonConfig.sizes[size].icon"
			aria-hidden="true">
			<svg
				class="spinner"
				:class="buttonConfig.sizes[size].spinner"
				viewBox="0 0 50 50"
				focusable="false"
				aria-hidden="true">
				<circle
					class="path"
					cx="25"
					cy="25"
					r="20"
					fill="none"
					stroke-width="4" />
			</svg>
		</span>

		<span
			v-if="$slots.icon && !loading"
			key="icon"
			class="hover:cursor-pointer"
			:class="buttonConfig.sizes[size].icon">
			<slot name="icon" />
		</span>
		<span class="hover:cursor-pointer">
			<slot />
		</span>
	</button>
</template>

<style scoped>
	.spinner {
		animation: rotate 1s linear infinite;
	}
	.path {
		stroke: currentColor;
		stroke-linecap: round;
		animation: dash 1.4s ease-in-out infinite;
	}

	/* spinner keyframes */
	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}
</style>
