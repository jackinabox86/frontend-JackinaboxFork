export type EXCHANGES_TYPE = "AI1" | "CI1" | "IC1" | "NC1";

export interface IMaterialExchangeOverview {
	Ask: Required<Record<EXCHANGES_TYPE, number>>;
	Bid: Required<Record<EXCHANGES_TYPE, number>>;
	Average: Required<Record<EXCHANGES_TYPE, number>>;
	PP7D: Required<Record<EXCHANGES_TYPE, number>>;
	PP30D: Required<Record<EXCHANGES_TYPE, number>>;
	Supply: Required<Record<EXCHANGES_TYPE, number>>;
	Demand: Required<Record<EXCHANGES_TYPE, number>>;
	Universe7D: number;
	Universe30D: number;
}
