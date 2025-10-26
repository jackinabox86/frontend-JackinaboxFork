<script setup lang="ts">
	import { useHead } from "@unhead/vue";

	useHead({
		title: "Password Reset | PRUNplanner",
	});

	defineProps({
		resetCode: {
			type: String,
			required: false,
			default: null,
		},
	});

	import PasswordReset from "@/features/account/components/PasswordReset.vue";
</script>

<template>
	<div class="flex justify-center items-center p-10">
		<div class="w-[400px] py-2 px-4 border border-white/10">
			<PasswordReset :reset-code="resetCode" />
		</div>
	</div>
</template>
