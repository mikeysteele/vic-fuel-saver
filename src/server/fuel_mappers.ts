import type { FuelApiResponse, FuelPriceDetail, FuelType } from "../types/fuel.ts";

export interface SnapshotRow {
  station_id: string;
  brand_id: string;
  station_name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  fuel_type: string;
  price: number;
  is_available: number;
  updated_at: string;
  previous_price: number | null;
}

export interface TrendRow { 
  station_id: string;
  fuel_type: string; 
  price: number; 
  updated_at: string; 
  prev_price: number | null; 
}

export function mapSnapshotRowsToApiResponse(rows: SnapshotRow[]): FuelApiResponse {
  const detailMap = new Map<string, FuelPriceDetail>();

  for (const row of rows) {
    if (!detailMap.has(row.station_id)) {
      detailMap.set(row.station_id, {
        fuelStation: {
          id: row.station_id,
          brandId: row.brand_id,
          name: row.station_name,
          address: row.address,
          suburb: row.suburb,
          state: row.state,
          postcode: row.postcode,
          location: { latitude: row.lat, longitude: row.lng },
        },
        fuelPrices: [],
        updatedAt: row.updated_at,
      });
    }

    const detail = detailMap.get(row.station_id)!;
    let trend: "up" | "down" | "flat" | undefined;
    
    if (row.previous_price !== null && row.previous_price !== undefined) {
        if (row.price > row.previous_price) trend = "up";
        else if (row.price < row.previous_price) trend = "down";
        else trend = "flat";
    }

    detail.fuelPrices.push({
      fuelType: row.fuel_type as FuelType,
      price: row.price,
      isAvailable: Boolean(row.is_available),
      updatedAt: row.updated_at,
      trend,
    });

    if (row.updated_at > detail.updatedAt) {
      detail.updatedAt = row.updated_at;
    }
  }

  return { fuelPriceDetails: Array.from(detailMap.values()) };
}

export function attachTrendsToApiResponse(data: FuelApiResponse, snapshot: TrendRow[]) {
  const prevMap = new Map<string, TrendRow>();
  for (const row of snapshot) prevMap.set(`${row.station_id}_${row.fuel_type}`, row);

  for (const detail of data.fuelPriceDetails) {
    for (const price of detail.fuelPrices) {
      const key = `${detail.fuelStation.id}_${price.fuelType}`;
      const hist = prevMap.get(key);
      if (hist) {
        if (new Date(price.updatedAt).getTime() > new Date(hist.updated_at).getTime()) {
          if (price.price > hist.price) price.trend = "up";
          else if (price.price < hist.price) price.trend = "down";
          else price.trend = "flat";
        } else {
          if (hist.prev_price !== null && hist.prev_price !== undefined) {
            if (price.price > hist.prev_price) price.trend = "up";
            else if (price.price < hist.prev_price) price.trend = "down";
            else price.trend = "flat";
          }
        }
      }
    }
  }
}
