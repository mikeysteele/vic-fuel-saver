import { sqliteTable, text, real, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

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
  price: real("price").notNull(),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull(),
  updatedAt: text("updated_at").notNull(), // When the station last updated its price (from API)
  syncedAt: text("synced_at").notNull(),   // When we synced this data (our timestamp)
}, (table) => {
  return [
    // Use syncedAt in the PK so every full sync run creates a complete snapshot
    primaryKey({ columns: [table.stationId, table.fuelType, table.syncedAt] }),
    index("prices_station_id_idx").on(table.stationId),
    index("prices_fuel_type_idx").on(table.fuelType),
    index("prices_synced_at_idx").on(table.syncedAt),
  ];
});

