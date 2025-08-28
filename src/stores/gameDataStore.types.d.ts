import { IExchange, IRecipe, IBuilding } from "@/features/api/gameData.types";

type IExchangesRecord = Record<string, IExchange>;
type IRecipesRecord = Record<string, IRecipe[]>;
type IBuildingsRecord = Record<string, IBuilding>;

type TOptionalDate = undefined | Date;

type IPlanetsLastRefreshedRecord = Record<string, TOptionalDate>;

interface IRefreshDataCheck {
	time: Date | undefined;
	staleMinutes: number;
	loadFunction: () => Promise<boolean>;
}
