import { vicFuelApiClient } from "./vic-fuel-api.ts";
import { createDb } from "./db/client.ts";
import { prices, stations } from "./db/schema.ts";
import { type AnyD1Database } from "drizzle-orm/d1/driver";
import { sql } from "drizzle-orm";


export async function syncFuelPrices(d1Database: AnyD1Database) {
  console.log("Starting fuel price sync...");
  const db = createDb(d1Database);

  try {
    const data = await vicFuelApiClient.fetchPrices();
    if (!data.fuelPriceDetails || data.fuelPriceDetails.length === 0) {
      console.log("No prices returned from API.");
      return { success: true, inserted: 0 };
    }

    console.log(`Fetched ${data.fuelPriceDetails.length} stations. Upserting into D1...`);

    const syncedAt = new Date().toISOString(); // single timestamp for the whole sync run
    const stationRows = [];
    const priceRows = [];

    for (const detail of data.fuelPriceDetails) {
      const station = detail.fuelStation;

      stationRows.push({
        id: station.id,
        brandId: station.brandId,
        name: station.name || "Unknown",
        address: station.address || "",
        suburb: station.suburb || "",
        state: station.state || "VIC",
        postcode: station.postcode || "",
        lat: station.location.latitude,
        lng: station.location.longitude,
      });

      for (const price of detail.fuelPrices) {
        // The API sometimes returns null for prices
        if (price.price === null || price.price === undefined) {
          continue;
        }

        priceRows.push({
          stationId: station.id,
          fuelType: price.fuelType,
          price: price.price,
          isAvailable: price.isAvailable,
          updatedAt: price.updatedAt,
          syncedAt,
        });
      }
    }

    // Cloudflare D1 supports batched statements, which avoids the SQL variable limit
    // that occurs when passing hundreds of variables to a single .values() array.
    
    // Insert Stations
    const stationQueries = stationRows.map(row => 
      db.insert(stations)
        .values(row)
        .onConflictDoUpdate({
          target: stations.id,
          set: {
            brandId: sql`excluded.brand_id`,
            name: sql`excluded.name`,
            address: sql`excluded.address`,
            suburb: sql`excluded.suburb`,
            state: sql`excluded.state`,
            postcode: sql`excluded.postcode`,
            lat: sql`excluded.lat`,
            lng: sql`excluded.lng`,
          }
        })
    );
    
    // Process station batches (D1 limit is typically 100 statements per batch)
    for (let i = 0; i < stationQueries.length; i += 100) {
      // Use cast since D1 batch parameter typing in this drizzle version requires it
      await db.batch(stationQueries.slice(i, i + 100) as unknown as Parameters<typeof db.batch>[0]);
    }

    // Insert Prices
    const priceQueries = priceRows.map(row => 
      db.insert(prices).values(row).onConflictDoNothing()
    );

    // Process price batches
    for (let i = 0; i < priceQueries.length; i += 100) {
      await db.batch(priceQueries.slice(i, i + 100) as unknown as Parameters<typeof db.batch>[0]);
    }

    console.log(`Sync complete. Processed ${stationRows.length} stations and ${priceRows.length} prices.`);
    return { success: true, stations: stationRows.length, prices: priceRows.length };
  } catch (error) {
    console.error("Failed to sync fuel prices:", error);
    throw error;
  }
}
