import { exchangesStore } from "@/database/stores";
import { useDB } from "@/database/composables/useDB";

// Types & Interfaces
import { IExchange } from "@/features/api/gameData.types";
import {
	EXCHANGES_TYPE,
	IMaterialExchangeOverview,
} from "@/database/services/useExchangeData.types";

export async function useExchangeData() {
	const exchangeTypesArray: EXCHANGES_TYPE[] = ["AI1", "CI1", "IC1", "NC1"];

	const { get, preload } = useDB(exchangesStore);

	async function getExchangeTicker(tickerId: string): Promise<IExchange> {
		const exchange = await get(tickerId);

		if (exchange) return exchange;

		throw new Error(
			`Exchange data for ticker '${tickerId}' not found. Ensure game data is loaded and ticker is valid.`
		);
	}

	async function getMaterialExchangeOverview(
		materialTicker: string
	): Promise<IMaterialExchangeOverview> {
		const universe7d = await getExchangeTicker(
			`${materialTicker}.PP7D_UNIVERSE`
		);
		const universe30d = await getExchangeTicker(
			`${materialTicker}.PP30D_UNIVERSE`
		);

		const overview: IMaterialExchangeOverview = {
			Ask: {} as Required<Record<EXCHANGES_TYPE, number>>,
			Bid: {} as Record<EXCHANGES_TYPE, number>,
			Average: {} as Record<EXCHANGES_TYPE, number>,
			PP7D: {} as Record<EXCHANGES_TYPE, number>,
			PP30D: {} as Record<EXCHANGES_TYPE, number>,
			Supply: {} as Record<EXCHANGES_TYPE, number>,
			Demand: {} as Record<EXCHANGES_TYPE, number>,
			Universe7D: universe7d.PriceAverage,
			Universe30D: universe30d.PriceAverage,
		};

		await Promise.all(
			exchangeTypesArray.map(async (type) => {
				const ticker = await getExchangeTicker(
					`${materialTicker}.${type}`
				);
				overview.Ask[type] = ticker.Ask ?? 0;
				overview.Bid[type] = ticker.Bid ?? 0;
				overview.Average[type] = ticker.PriceAverage;
				overview.Supply[type] = ticker.Supply ?? 0;
				overview.Demand[type] = ticker.Demand ?? 0;

				const [d7ticker, d30ticker] = await Promise.all([
					getExchangeTicker(`${materialTicker}.PP7D_${type}`),
					getExchangeTicker(`${materialTicker}.PP30D_${type}`),
				]);
				overview.PP7D[type] = d7ticker.PriceAverage;
				overview.PP30D[type] = d30ticker.PriceAverage;
			})
		);

		return overview;
	}

	return {
		preload,
		getExchangeTicker,
		getMaterialExchangeOverview,
		exchangeTypesArray,
	};
}
