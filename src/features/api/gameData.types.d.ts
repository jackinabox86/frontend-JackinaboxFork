export interface IMaterial {
	MaterialId: string;
	CategoryName: string;
	CategoryId: string;
	Name: string;
	Ticker: string;
	Weight: number;
	Volume: number;
}

export interface IExchange {
	TickerId: string;
	MaterialTicker: string;
	ExchangeCode: string;
	Ask: number | null;
	Bid: number | null;
	PriceAverage: number | null;
	Supply: number | null;
	Demand: number | null;
	Traded: number | null;

	[key: string]: string | number | null;
}

export interface IRecipeMaterial {
	Ticker: string;
	Amount: number;
}

export interface IRecipe {
	RecipeId: string;
	BuildingTicker: string;
	RecipeName: string;
	TimeMs: number;
	Inputs: IRecipeMaterial[];
	Outputs: IRecipeMaterial[];
}

export interface IBuildingCost {
	CommodityTicker: string;
	Weight: number;
	Volume: number;
	Amount: number;
}

export interface IBuildingHabitation {
	Pioneer: number;
	Settler: number;
	Technician: number;
	Engineer: number;
	Scientist: number;
	Area: number;
}

export type BUILDING_EXPERTISE_TYPE =
	| "AGRICULTURE"
	| "CHEMISTRY"
	| "CONSTRUCTION"
	| "ELECTRONICS"
	| "FOOD_INDUSTRIES"
	| "FUEL_REFINING"
	| "MANUFACTURING"
	| "METALLURGY"
	| "RESOURCE_EXTRACTION";

type BUILDING_TYPE = "INFRASTRUCTURE" | "PLANETARY" | "PRODUCTION";

export interface IBuilding {
	Name: string;
	Ticker: string;
	Pioneers: number;
	Settlers: number;
	Technicians: number;
	Engineers: number;
	Scientists: number;
	AreaCost: number;
	BuildingCosts: IBuildingCost[];
	Habitation: IBuildingHabitation | null;
	Expertise: BUILDING_EXPERTISE_TYPE | null;
	Type: BUILDING_TYPE;

	[key: string]:
		| string
		| number
		| null
		| IBuildingCost[]
		| IBuildingHabitation
		| BUILDING_TYPE;
}

export type PLANET_RESOURCETYPE_TYPE = "MINERAL" | "GASEOUS" | "LIQUID";
type PLANET_DISTANCE_NAMES =
	| "Moria Station"
	| "Antares Station"
	| "Benten Station"
	| "Hortus Station";

export interface IPlanetResource {
	MaterialId: string;
	ResourceType: PLANET_RESOURCETYPE_TYPE;
	Factor: number;
	DailyExtraction: number;
	MaterialTicker: string;
	ExtractionMax: number;
}

export interface IPlanetDistance {
	name: PLANET_DISTANCE_NAMES;
	distance: number;
}

export interface IPlanetCheckDistance {
	SystemIdStart: string;
	SystemIdTarget: string;
	SystemName: string;
	Distance: number;
}

export type PLANET_COGCPROGRAM_TYPE =
	| "Invalid"
	| "ADVERTISING_AGRICULTURE"
	| "ADVERTISING_CHEMISTRY"
	| "ADVERTISING_CONSTRUCTION"
	| "ADVERTISING_ELECTRONICS"
	| "ADVERTISING_FOOD_INDUSTRIES"
	| "ADVERTISING_FUEL_REFINING"
	| "ADVERTISING_MANUFACTURING"
	| "ADVERTISING_METALLURGY"
	| "ADVERTISING_RESOURCE_EXTRACTION"
	| "WORKFORCE_PIONEERS"
	| "WORKFORCE_SETTLERS"
	| "WORKFORCE_TECHNICIANS"
	| "WORKFORCE_ENGINEERS"
	| "WORKFORCE_SCIENTISTS";

export interface IPlanetCOGCProgram {
	ProgramType: PLANET_COGCPROGRAM_TYPE | null;
	StartEpochMs: number;
	EndEpochMs: number;
}

type PLANET_COGCPROGRAM_STATUS_TYPE = "ACTIVE" | "ON_STRIKE" | "PLANNED";

export interface IPlanet {
	PlanetId: string;
	PlanetNaturalId: string;
	PlanetName: string;
	SystemId: string;
	HasLocalMarket: boolean;
	HasChamberOfCommerce: boolean;
	HasWarehouse: boolean;
	HasAdministrationCenter: boolean;
	HasShipyard: boolean;
	Pressure: number;
	Surface: boolean;
	Temperature: number;
	Fertility: number;
	Gravity: number;
	FactionCode: string | null;
	FactionName: string | null;
	GovernorUserName: string | null;
	COGCProgramStatus: PLANET_COGCPROGRAM_STATUS_TYPE | null;

	Resources: IPlanetResource[];
	Distances: IPlanetDistance[];
	COGCPrograms: IPlanetCOGCProgram[];
	COGCProgramActive: PLANET_COGCPROGRAM_TYPE | null;
	CheckDistances: IPlanetCheckDistance | null;
}

export interface IFIOStorageItem {
	MaterialId: string;
	MaterialName: string;
	MaterialTicker: string;
	MaterialCategory: string;
	MaterialWeight: number;
	MaterialVolume: number;
	MaterialAmount: number;
	MaterialValue: number;
	MaterialValueCurrency?: string;
	Type: string;
	TotalWeight: number;
	TotalVolume: number;
}

interface IFIOStorageBase {
	StorageId: string;
	AddressableId: string;
	Name: string | null;
	Type: string;
	UserNameSubmitted: string;
	Timestamp: Date;
	WeightCapacity: number;
	VolumeCapacity: number;

	StorageItems: IFIOStorageItem[];
}

export interface IFIOStoragePlanet extends IFIOStorageBase {
	PlanetId: string;
	PlanetIdentifier: string;
	PlanetName?: string;
	WeightLoad: number;
	VolumeLoad: number;
}

export interface IFIOStorageWarehouse extends IFIOStorageBase {
	LocationNaturalId: string;
	LocationName?: string | null;
	WarehouseId?: string | null;
	Units?: number | null;

	NextPaymentTimestampEpochMs?: number | null;
	FeeAmount?: number | null;
	FeeCurrency?: string | null;
	FeeCollectorId?: string | null;
	FeeCollectorName?: string | null;
	FeeCollectorCode?: string | null;
}

export interface IFIOStorageShip extends IFIOStorageBase {
	WeightLoad: number;
	VolumeLoad: number;
	Registration: string;
}

export interface IFIOStorage {
	planets: Record<string, IFIOStoragePlanet>;
	warehouses: Record<string, IFIOStorageWarehouse>;
	ships: Record<string, IFIOStorageShip>;
}

export interface IFIOSitePlanetBuildingMaterial {
	MaterialId: string;
	MaterialName: string;
	MaterialTicker: string;
	MaterialAmount: number;
}

export interface IFIOSitePlanetBuilding {
	SiteBuildingId: string;
	BuildingId: string;
	BuildingCreated: Date;
	BuildingName: string;
	BuildingTicker: string;
	BuildingLastRepair?: Date;
	Condition: number;
	AgeDays?: number | null;
	ReclaimableMaterials: IFIOSitePlanetBuildingMaterial[];
	RepairMaterials: IFIOSitePlanetBuildingMaterial[];
}

export interface IFIOSitePlanet {
	SiteId: string;
	PlanetId: string;
	PlanetIdentifier: string;
	PlanetName: string;
	PlanetFoundedEpochMs: number;
	InvestedPermits: number;
	MaximumPermits: number;
	UserNameSubmitted: string;
	Timestamp: Date;

	Buildings: IFIOSitePlanetBuilding[];
}

export interface IFIOSiteShipRepairMaterial {
	ShipRepairMaterialId: string;
	MaterialName: string;
	MaterialId: string;
	MaterialTicker: string;
	Amount: number;
}

export interface IFIOSiteShipAddressLine {
	LineId: string;
	LineType: string;
	NaturalId: string;
	Name: string;
}

export interface IFIOSiteShip {
	ShipId: string;
	StoreId: string;
	StlFuelStoreId: string;
	FtlFuelStoreId: string;
	Registration: string;
	Name?: string | null;
	CommissioningTimeEpochMs: number;
	Condition: number;
	LastRepairEpochMs?: number | null;
	Location: string;

	RepairMaterials: IFIOSiteShipRepairMaterial[];
	AddressLines: IFIOSiteShipAddressLine[];
}

export interface IFIOSites {
	planets: Record<string, IFIOSitePlanet>;
	ships: Record<string, IFIOSiteShip>;
}

export interface IPlanetSearchAdvanced {
	Materials: string[];
	COGC: PLANET_COGCPROGRAM_TYPE[];
	IncludeRocky: boolean;
	IncludeGaseous: boolean;
	IncludeLowGravity: boolean;
	IncludeHighGravity: boolean;
	IncludeLowPressure: boolean;
	IncludeHighPressure: boolean;
	IncludeLowTemperature: boolean;
	IncludeHighTemperature: boolean;
	MustBeFertile: boolean;
	MustHaveLocalMarket: boolean;
	MustHaveChamberOfCommerce: boolean;
	MustHaveWarehouse: boolean;
	MustHaveAdministrationCenter: boolean;
	MustHaveShipyard: boolean;
	MaxDistanceCheck?: {
		SystemId: string;
		MaxDistance: number;
	};
}

export interface IPopulationReport {
	InfrastructureReportId: string;
	ExplorersGraceEnabled: boolean;
	SimulationPeriod: number;
	NextPopulationPioneer: number;
	NextPopulationSettler: number;
	NextPopulationTechnician: number;
	NextPopulationEngineer: number;
	NextPopulationScientist: number;
	PopulationDifferencePioneer: number;
	PopulationDifferenceSettler: number;
	PopulationDifferenceTechnician: number;
	PopulationDifferenceEngineer: number;
	PopulationDifferenceScientist: number;
	UnemploymentRatePioneer: number;
	UnemploymentRateSettler: number;
	UnemploymentRateTechnician: number;
	UnemploymentRateEngineer: number;
	UnemploymentRateScientist: number;
	OpenJobsPioneer: number;
	OpenJobsSettler: number;
	OpenJobsTechnician: number;
	OpenJobsEngineer: number;
	OpenJobsScientist: number;
	TimestampMs: Date;
	FreePioneer: number;
	FreeSettler: number;
	FreeTechnician: number;
	FreeEngineer: number;
	FreeScientist: number;

	CurrentOpenJobsPioneer?: number;
	CurrentOpenJobsSettler?: number;
	CurrentOpenJobsTechnician?: number;
	CurrentOpenJobsEngineer?: number;
	CurrentOpenJobsScientist?: number;

	AvailablePioneer?: number;
	AvailableSettler?: number;
	AvailableTechnician?: number;
	AvailableEngineer?: number;
	AvailableScientist?: number;

	TrueHappinessPioneer?: number;
	TrueHappinessSettler?: number;
	TrueHappinessTechnician?: number;
	TrueHappinessEngineer?: number;
	TrueHappinessScientist?: number;
}
