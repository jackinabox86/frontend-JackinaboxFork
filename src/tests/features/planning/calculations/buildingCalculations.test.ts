import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// Stores
import { useGameDataStore } from "@/stores/gameDataStore";

// Composables
import { useBuildingCalculation } from "@/features/planning/calculations/buildingCalculations";

describe("Planning: Workforce Calculations", async () => {
	let gameDataStore: any;

	beforeEach(() => {
		setActivePinia(createPinia());
		gameDataStore = useGameDataStore();
	});

	describe("calculateMaterialIO", async () => {
		it("Calculate whole production material io", async () => {
			const { calculateMaterialIO } = await useBuildingCalculation();

			const fakeData = [
				{
					amount: 1,
					totalBatchTime: 17280000 + 51840000,
					activeRecipes: [
						{
							recipeId: "foo",
							amount: 1,
							time: 17280000,
							recipe: {
								Inputs: [
									{ Ticker: "DW", Amount: 20 },
									{ Ticker: "EPO", Amount: 5 },
								],
								Outputs: [{ Ticker: "O", Amount: 3 }],
							},
						},
						{
							recipeId: "moo",
							amount: 1,
							time: 51840000,
							recipe: {
								Inputs: [
									{ Ticker: "MG", Amount: 3 },
									{ Ticker: "O", Amount: 1 },
								],
								Outputs: [{ Ticker: "NR", Amount: 3 }],
							},
						},
					],
				},
			];

			// @ts-expect-error mocked data
			const result = calculateMaterialIO(fakeData);

			expect(result).toStrictEqual([
				{
					input: 25,
					output: 0,
					ticker: "DW",
				},
				{
					input: 6.25,
					output: 0,
					ticker: "EPO",
				},
				{
					input: 3.75,
					output: 0,
					ticker: "MG",
				},
				{
					input: 1.25,
					output: 3.75,
					ticker: "O",
				},
				{
					input: 0,
					output: 3.75,
					ticker: "NR",
				},
			]);
		});

		it("Skip recipes which amount = 0", async () => {
			const { calculateMaterialIO } = await useBuildingCalculation();

			const fakeData = [
				{
					amount: 1,
					totalBatchTime: 17280000 + 51840000,
					activeRecipes: [
						{
							recipeId: "foo",
							amount: 0,
							time: 17280000,
							recipe: {
								Inputs: [
									{ Ticker: "DW", Amount: 20 },
									{ Ticker: "EPO", Amount: 5 },
								],
								Outputs: [{ Ticker: "O", Amount: 3 }],
							},
						},
						{
							recipeId: "moo",
							amount: 1,
							time: 51840000,
							recipe: {
								Inputs: [
									{ Ticker: "MG", Amount: 3 },
									{ Ticker: "O", Amount: 1 },
								],
								Outputs: [{ Ticker: "NR", Amount: 3 }],
							},
						},
					],
				},
			];

			// @ts-expect-error mocked data
			const result = calculateMaterialIO(fakeData);

			expect(result).toStrictEqual([
				{
					input: 3.75,
					output: 0,
					ticker: "MG",
				},
				{
					input: 1.25,
					output: 0,
					ticker: "O",
				},
				{
					input: 0,
					output: 3.75,
					ticker: "NR",
				},
			]);
		});
	});
});
