export interface Location {
  latitude: number;
  longitude: number;
}

export interface FuelStation {
  id: string;
  brandId: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  location: Location;
}
export type FuelType =
  | "U91"
  | "P95"
  | "P98"
  | "PDSL"
  | "LPG"
  | "B20"
  | "E85"
  | "LNG"
  | "DSL"
  | "E10";

export interface FuelPrice {
  fuelType: FuelType;
  price: number;
  isAvailable: boolean;
  updatedAt: string;
  trend?: "up" | "down" | "flat";
}

export interface FuelPriceDetail {
  fuelStation: FuelStation;
  fuelPrices: FuelPrice[];
  updatedAt: string;
}

export interface FuelApiResponse {
  fuelPriceDetails: FuelPriceDetail[];
}

export interface FuelPriceEntry {
  stationId: string;
  fuelPrices: FuelPrice[];
  updatedAt: string;
}

export interface FuelPricesResponse {
  prices: FuelPriceEntry[];
}

export interface FuelMetricStat {
  price: number;
  stationId: string;
  lat: number;
  lng: number;
}
export interface FuelMetricsAggregate {
  avg: number;
  min: FuelMetricStat | null;
  max: FuelMetricStat | null;
}

export interface FuelBrand {
  id: string;
  name: string;
  type: string;
}

export interface FuelBrandsResponse {
  brands: FuelBrand[];
}
