import {
	ICXDataExchangeOption,
	ICXDataTickerOption,
} from "@/stores/planningStore.types";
import { ExchangeType, ICXPlanetMap, PreferenceType } from "./manageCX.types";

import Papa from "papaparse";

interface IExchangeCSVRow {
	Location: string;
	Type: string;
	CX: string;
	Ticker: string;
	Price: string;
}

export function useCXImportExport() {
	const parseSettingsCSV = (
		file: File
	): Promise<{
		empireCX: ICXDataExchangeOption[];
		empireTickerOptions: ICXDataTickerOption[];
		planetsCX: ICXPlanetMap[];
		plantesTickerOptions: ICXPlanetMap[];
	}> => {
		return new Promise((resolve, reject) => {
			Papa.parse<IExchangeCSVRow>(file, {
				header: true,
				complete: (results) => {
					const empireCX: ICXDataExchangeOption[] = [];
					const empireTickerOptions: ICXDataTickerOption[] = [];

					const planetsCXMap = new Map<string, ICXPlanetMap>();
					const planetTickerOptionsMap = new Map<
						string,
						ICXPlanetMap
					>();

					results.data.forEach((row) => {
						if (!row.Location) return;

						const isEmpire = row.Location === "EMPIRE";
						const isTicker = row.Ticker && row.Ticker.trim() !== "";
						if (isEmpire) {
							if (!isTicker) {
								empireCX.push({
									type: row.Type as PreferenceType,
									exchange: row.CX as ExchangeType,
								});
							} else {
								empireTickerOptions.push({
									type: row.Type as PreferenceType,
									ticker: row.Ticker,
									value: Number(row.Price),
								});
							}
						} else if (!isEmpire) {
							const targetMap = isTicker
								? planetTickerOptionsMap
								: planetsCXMap;

							let planetData = targetMap.get(row.Location);

							if (!planetData) {
								planetData = {
									planet: row.Location,
									preferences: [],
								};
								targetMap.set(row.Location, planetData);
							}

							if (!isTicker) {
								planetData.preferences.push({
									type: row.Type as PreferenceType,
									exchange: row.CX as ExchangeType,
								});
							} else {
								planetData.preferences.push({
									type: row.Type as PreferenceType,
									ticker: row.Ticker,
									value: Number(row.Price),
								});
							}
						}
					});

					resolve({
						empireCX,
						empireTickerOptions,
						planetsCX: Array.from(planetsCXMap.values()),
						plantesTickerOptions: Array.from(
							planetTickerOptionsMap.values()
						),
					});
				},
				error: (error) => reject(error),
			});
		});
	};
	const generateSettingsCSV = (
		empireCX: ICXDataExchangeOption[],
		empireTickerOptions: ICXDataTickerOption[],
		planetsCX: ICXPlanetMap[],
		plantesTickerOptions: ICXPlanetMap[]
	): string => {
		let csvContent = "Location;Type;CX;Ticker;Price";

		if (empireCX) {
			for (const option of empireCX) {
				csvContent = `${csvContent}\nEMPIRE;${option.type};${option.exchange};;`;
			}
		}

		if (planetsCX) {
			for (const planet of planetsCX) {
				for (const option of planet.preferences) {
					csvContent = `${csvContent}\n${planet.planet};${option.type};${option.exchange};;`;
				}
			}
		}

		if (empireTickerOptions) {
			for (const option of empireTickerOptions) {
				csvContent = `${csvContent}\nEMPIRE;${option.type};;${option.ticker};${option.value}`;
			}
		}

		if (plantesTickerOptions) {
			for (const planet of plantesTickerOptions) {
				for (const option of planet.preferences) {
					csvContent = `${csvContent}\n${planet.planet};${option.type};;${option.ticker};${option.value}`;
				}
			}
		}
		return csvContent;
	};

	return {
		parseSettingsCSV,
		generateSettingsCSV,
	};
}
