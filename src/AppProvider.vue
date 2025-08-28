<script setup lang="ts">
	// Theme
	import {
		NConfigProvider,
		NModalProvider,
		NDialogProvider,
		darkTheme,
	} from "naive-ui";
	import { prunplannerTheme } from "@/layout/prunplannerNaiveUI";

	// Components

	import App from "@/App.vue";

	// Unhead
	import { useHead } from "@unhead/vue";
	useHead({
		title: "PRUNplanner",
	});
</script>

<template>
	<n-config-provider :theme="darkTheme" :theme-overrides="prunplannerTheme">
		<n-modal-provider>
			<n-dialog-provider>
				<App />
			</n-dialog-provider>
		</n-modal-provider>
	</n-config-provider>
</template>
