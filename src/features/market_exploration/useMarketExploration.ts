// Composables
import { useQuery } from "@/lib/query_cache/useQuery";

// Util
import { formatDate } from "@/util/date";

// Types & Interfaces
import {
	IExploration,
	IExplorationRequestPayload,
	IMaterialExplorationRecord,
} from "@/features/market_exploration/marketExploration.types";

export function useMarketExploration() {
	/**
	 * Requests last 7 days of exploration data for
	 * AI1, CI1, IC1, NC1 for single material ticker
	 * @author jplacht
	 *
	 * @async
	 * @param {string} ticker Material Ticker, e.g. "DW"
	 * @returns {Promise<IMaterialExplorationRecord>} Exploration Data of last 7 days
	 */
	async function getMaterialExplorationData(
		ticker: string
	): Promise<IMaterialExplorationRecord> {
		const data: IMaterialExplorationRecord = {
			AI1: [],
			CI1: [],
			IC1: [],
			NC1: [],
		};

		const todayString: string = formatDate(new Date());
		const sevenAgoString: string = formatDate(
			new Date(new Date().setDate(new Date().getDate() - 7))
		);

		const fetchPayload: IExplorationRequestPayload = {
			start: sevenAgoString,
			end: todayString,
		};

		// fetch multiple exploration data
		const fetchPromises: Promise<IExploration[]>[] = [
			"AI1",
			"CI1",
			"IC1",
			"NC1",
		].map((exchangeTicker) =>
			useQuery("GetExplorationData", {
				exchangeTicker: exchangeTicker,
				materialTicker: ticker,
				payload: fetchPayload,
			})
				.execute()
				.then(
					(result: IExploration[]) => (data[exchangeTicker] = result)
				)
		);

		await Promise.all(fetchPromises);

		return data;
	}

	return {
		getMaterialExplorationData,
	};
}
