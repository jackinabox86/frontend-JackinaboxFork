// Composables
import { useBuildingData } from "@/database/services/useBuildingData";

// Types & Interfaces
import {
	IBuilding,
	IRecipe,
	IRecipeMaterial,
} from "@/features/api/gameData.types";
import { IProductionGraphIO } from "@/features/production_chain/productionGraph.types";

// this is static for "O" (from COL, but also has a TCO recipe)
const nodeExclusion: string[] = ["O"];

export class ProductionNode {
	readonly materialTicker: string;
	recipes: IRecipe[];
	amount: number = 0;
	recipeAmount: number = 1;
	hasInput: boolean = false;
	hasOutput: boolean = false;

	public constructor(materialTicker: string) {
		this.materialTicker = materialTicker;
		this.recipes = [];
	}

	get id(): string {
		return `NODE#${this.materialTicker}`;
	}

	get type(): string {
		return "chain";
	}

	addRecipe(recipe: IRecipe): void {
		if (!this.recipes.includes(recipe)) this.recipes.push(recipe);
	}

	getOutput(
		ticker: string,
		selectedRecipes: string[]
	): undefined | IProductionGraphIO {
		const recipe: IRecipe | undefined = this.getRecipe(selectedRecipes);

		if (recipe) {
			const output: IRecipeMaterial[] = recipe.Outputs.filter(
				(o) => o.Ticker === ticker
			);

			if (output.length > 0)
				return {
					materialTicker: output[0].Ticker,
					quantity: output[0].Amount,
				};
		}

		return undefined;
	}

	getInput(selectedRecipes: string[]): IProductionGraphIO[] {
		const inputs: IProductionGraphIO[] = [];

		if (!nodeExclusion.includes(this.materialTicker)) {
			// find the correct recipe
			const recipe: IRecipe | undefined = this.getRecipe(selectedRecipes);

			if (recipe)
				recipe.Inputs.map((i) => {
					inputs.push({
						materialTicker: i.Ticker,
						quantity: i.Amount,
					});
				});
		}

		return inputs;
	}

	getRecipe(selectedRecipes: string[]): IRecipe | undefined {
		// skip if there is no recipe, but also not in exclusion
		if (
			!nodeExclusion.includes(this.materialTicker) &&
			this.recipes.length === 0
		)
			return undefined;

		// this is a fake recipe for "O" which is from a COL but also has a TCO recipe
		if (nodeExclusion.includes(this.materialTicker))
			return {
				RecipeId: "COL#=>",
				BuildingTicker: "COL",
				RecipeName: "=>",
				TimeMs: 0,
				Inputs: [],
				Outputs: [{ Amount: 1, Ticker: this.materialTicker }],
			};

		if (selectedRecipes.length > 0) {
			const selectionMatch: IRecipe[] = this.recipes.filter((f) =>
				selectedRecipes.includes(f.RecipeId)
			);

			if (selectionMatch.length > 1) {
				throw new Error(
					`There can't be multiple matches for: ${this.materialTicker}, ${selectedRecipes}`
				);
			}
			if (selectionMatch.length === 0) return this.recipes[0];
			else return selectionMatch[0];
		}

		return this.recipes[0];
	}

	async getBuildingData(
		selectedRecipes: string[]
	): Promise<IBuilding | undefined> {
		const recipe: IRecipe | undefined = this.getRecipe(selectedRecipes);
		const { getBuilding } = await useBuildingData();

		if (recipe) return await getBuilding(recipe.BuildingTicker);
		return undefined;
	}
}
