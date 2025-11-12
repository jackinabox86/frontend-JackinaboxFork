import { exchangesStore } from "@/database/stores";
import { useDB } from "@/database/composables/useDB";
import { useQuery } from "@/lib/query_cache/useQuery";
import { formatDate } from "@/util/date";

// Types & Interfaces
import { IExchange } from "@/features/api/gameData.types";
import {
	EXCHANGES_TYPE,
	IMaterialExchangeOverview,
} from "@/database/services/useExchangeData.types";
import { IExploration } from "@/features/market_exploration/marketExploration.types";

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
			Traded1Day: {} as Required<Record<EXCHANGES_TYPE, number>>,
			Traded7Days: {} as Required<Record<EXCHANGES_TYPE, number>>,
			Universe7D: universe7d.PriceAverage ?? 0,
			Universe30D: universe30d.PriceAverage ?? 0,
		};

		await Promise.all(
			exchangeTypesArray.map(async (type) => {
				const ticker = await getExchangeTicker(
					`${materialTicker}.${type}`
				);
				overview.Ask[type] = ticker.Ask ?? 0;
				overview.Bid[type] = ticker.Bid ?? 0;
				overview.Average[type] = ticker.PriceAverage ?? 0;
				overview.Supply[type] = ticker.Supply ?? 0;
				overview.Demand[type] = ticker.Demand ?? 0;
				overview.Traded1Day[type] = 0;
				overview.Traded7Days[type] = 0;

				const [d7ticker, d30ticker] = await Promise.all([
					getExchangeTicker(`${materialTicker}.PP7D_${type}`),
					getExchangeTicker(`${materialTicker}.PP30D_${type}`),
				]);
				overview.PP7D[type] = d7ticker.PriceAverage ?? 0;
				overview.PP30D[type] = d30ticker.PriceAverage ?? 0;
			})
		);

		return overview;
	}

	async function getMaterialTradedVolume(
		materialTicker: string
	): Promise<
		Pick<IMaterialExchangeOverview, "Traded1Day" | "Traded7Days">
	> {
		const todayString: string = formatDate(new Date());
		const sevenDaysAgoString: string = formatDate(
			new Date(new Date().setDate(new Date().getDate() - 7))
		);

		const tradedData: Pick<
			IMaterialExchangeOverview,
			"Traded1Day" | "Traded7Days"
		> = {
			Traded1Day: {} as Required<Record<EXCHANGES_TYPE, number>>,
			Traded7Days: {} as Required<Record<EXCHANGES_TYPE, number>>,
		};

		await Promise.all(
			exchangeTypesArray.map(async (type) => {
				try {
					const explorationData: IExploration[] = await useQuery(
						"GetExplorationData",
						{
							exchangeTicker: type,
							materialTicker: materialTicker,
							payload: {
								start: sevenDaysAgoString,
								end: todayString,
							},
						}
					).execute();

					// Calculate yesterday's volume (most recent day)
					if (explorationData.length > 0) {
						const mostRecentDay =
							explorationData[explorationData.length - 1];
						tradedData.Traded1Day[type] =
							mostRecentDay.volume_max ?? 0;
					} else {
						tradedData.Traded1Day[type] = 0;
					}

					// Sum last 7 days volumes
					const sum = explorationData.reduce(
						(total, day) => total + (day.volume_max ?? 0),
						0
					);
					tradedData.Traded7Days[type] = sum;
				} catch (error) {
					// If data fetch fails, default to 0
					tradedData.Traded1Day[type] = 0;
					tradedData.Traded7Days[type] = 0;
				}
			})
		);

		return tradedData;
	}

	return {
		preload,
		getExchangeTicker,
		getMaterialExchangeOverview,
		getMaterialTradedVolume,
		exchangeTypesArray,
	};
}
