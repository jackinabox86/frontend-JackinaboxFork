<script setup lang="ts">
	import { computed, ComputedRef, nextTick, PropType, ref, Ref } from "vue";

	// Composables
	import { useXITAction } from "@/features/xit/useXITAction";
	const { transferJSON } = useXITAction();
	import { usePreferences } from "@/features/preferences/usePreferences";
	const { burnOrigin, defaultBuyItemsFromCX } = usePreferences();
	import { usePostHog } from "@/lib/usePostHog";
	const { capture } = usePostHog();

	// Components
	import MaterialTile from "@/features/material_tile/components/MaterialTile.vue";

	// Util
	import { copyToClipboard } from "@/util/data";
	import { formatAmount } from "@/util/numbers";

	// Constants
	import { XITSTATIONWAREHOUSES } from "@/features/xit/xitConstants";

	// Types & Interfaces
	import { IXITTransferMaterial } from "@/features/xit/xitAction.types";

	// UI
	import {
		PButton,
		PCheckbox,
		PForm,
		PFormItem,
		PInput,
		PSelect,
	} from "@/ui";
	import { NDrawer, NDrawerContent, NTable } from "naive-ui";

	const props = defineProps({
		elements: {
			type: Array as PropType<IXITTransferMaterial[]>,
			required: true,
		},
		transferName: {
			type: String,
			required: false,
			default: "Transfer",
		},
		// Button Definitions
		buttonText: {
			type: String,
			required: false,
			default: "XIT",
		},
		buttonSize: {
			type: String as PropType<"sm" | "md">,
			required: false,
			default: "md",
		},
		buttonSecondary: {
			type: Boolean,
			required: false,
			default: false,
		},
		// Drawer Definitions
		drawerTitle: {
			type: String,
			required: false,
			default: "XIT Action",
		},
		drawerWidth: {
			type: Number,
			required: false,
			default: 650,
		},
	});

	// local elements
	const localElements: ComputedRef<IXITTransferMaterial[]> = computed(() =>
		props.elements.filter((f) => f.value > 0)
	);

	// Drawer Display
	const loadDrawer: Ref<boolean> = ref(false);
	const showDrawer: Ref<boolean> = ref(false);

	function show(): void {
		if (!showDrawer.value) {
			capture("xit_transfer_show");
			loadDrawer.value = true;
			nextTick().then(() => (showDrawer.value = true));
		}
	}
</script>

<template>
	<PButton
		:size="buttonSize"
		:type="buttonSecondary ? 'secondary' : 'primary'"
		@click="show">
		{{ buttonText }}
	</PButton>

	<n-drawer v-if="loadDrawer" v-model:show="showDrawer" :width="drawerWidth">
		<n-drawer-content closable body-class="bg-black">
			<template #header> {{ drawerTitle }} </template>

			<PForm>
				<PFormItem label="Origin">
					<PSelect
						v-model:value="burnOrigin"
						:options="XITSTATIONWAREHOUSES" />
				</PFormItem>
				<PFormItem label="Buy From CX">
					<PCheckbox
						v-model:checked="defaultBuyItemsFromCX"
						:disabled="burnOrigin === 'Configure on Execution'" />

					<div
						v-if="burnOrigin === 'Configure on Execution'"
						class="p-3">
						Requires origin warehouse to purchase
					</div>
				</PFormItem>
				<PFormItem label="JSON">
					<div class="w-full flex flex-row gap-1">
						<div class="flex-grow">
							<PInput
								v-model:value="
									transferJSON(localElements, {
										name: transferName,
										origin: burnOrigin,
										buy: defaultBuyItemsFromCX,
									}).value
								"
								type="textarea"
								class="w-full" />
						</div>
						<div>
							<PButton
								@click="
									() => {
										capture('xit_transfer_copy');
										copyToClipboard(
											transferJSON(localElements, {
												name: transferName,
												origin: burnOrigin,
												buy: defaultBuyItemsFromCX,
											}).value
										);
									}
								">
								Copy
							</PButton>
						</div>
					</div>
				</PFormItem>
			</PForm>

			<n-table striped class="mt-3">
				<thead>
					<tr>
						<th>Ticker</th>
						<th>Amount</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="element in localElements"
						:key="`TRANSFER#${element.ticker}`">
						<td>
							<MaterialTile
								:key="element.ticker"
								:ticker="element.ticker" />
						</td>
						<td>{{ formatAmount(element.value) }}</td>
					</tr>
				</tbody>
			</n-table>
		</n-drawer-content>
	</n-drawer>
</template>
