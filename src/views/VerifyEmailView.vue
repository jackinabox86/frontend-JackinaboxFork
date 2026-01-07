<script setup lang="ts">
	import { useHead } from "@unhead/vue";

	useHead({
		title: "Email Verification | PRUNplanner",
	});

	import VerifyEmailComponent from "@/features/account/components/VerifyEmailComponent.vue";
</script>

<template>
	<div class="flex justify-center items-center p-10">
		<div class="w-100 py-2 px-4 border border-white/10">
			<VerifyEmailComponent />
		</div>
	</div>
</template>
