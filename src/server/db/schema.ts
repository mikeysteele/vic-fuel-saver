import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const stations = sqliteTable("stations", {
  id: text("id").primaryKey(), // We use the exact ID from the API
  brandId: text("brand_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postcode: text("postcode").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});

export const prices = sqliteTable("prices", {
  stationId: text("station_id").notNull(),
  fuelType: text("fuel_type").notNull(),
  priceDate: text("price_date").notNull(), // 'YYYY-MM-DD' — one row per station/fuel/day
  price: real("price").notNull(),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull(),
  updatedAt: text("updated_at").notNull(), // When the station last updated its price (from API)
  syncedAt: text("synced_at").notNull(), // When we last synced this row (our timestamp)
}, (table) => {
  return [
    primaryKey({ columns: [table.stationId, table.fuelType, table.priceDate] }),
    index("prices_station_id_idx").on(table.stationId),
    index("prices_fuel_type_idx").on(table.fuelType),
    index("prices_price_date_idx").on(table.priceDate),
  ];
});
