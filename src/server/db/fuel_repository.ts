import { sql } from "drizzle-orm";
import { createDb } from "./client.ts";
import { type AnyD1Database } from "drizzle-orm/d1";

export class FuelRepository {
  private db;
  private d1: AnyD1Database;
  constructor(d1: AnyD1Database) {
    this.d1 = d1;
    this.db = createDb(d1);
  }

  async getRecentTrends() {
    return await this.db.all(sql`
      WITH RankedChanges AS (
        SELECT 
          station_id, 
          fuel_type, 
          price, 
          updated_at,
          LAG(price) OVER(PARTITION BY station_id, fuel_type ORDER BY price_date ASC) as prev_price,
          ROW_NUMBER() OVER(PARTITION BY station_id, fuel_type ORDER BY price_date DESC) as rn
        FROM prices
      )
      SELECT station_id, fuel_type, price, updated_at, prev_price FROM RankedChanges WHERE rn = 1
    `) as { station_id: string, fuel_type: string, price: number, updated_at: string, prev_price: number | null }[];
  }

  async getEarliestSyncDate(): Promise<{ date: string | null }> {
    try {
      const result = await this.d1.prepare("SELECT MIN(price_date) as date FROM prices").all();
      const firstRow = result.results[0] as Record<string, unknown> | undefined;
      return { date: (firstRow?.date as string) || null };
    } catch (e: unknown) {
      try {
        const tables = await this.d1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        const names = tables.results.map((r: Record<string, unknown>) => r.name).join(", ");
        console.error(`D1 Early Date Query failed. Tables: [${names}]. Error: ${e instanceof Error ? e.message : String(e)}`);
      } catch (e2) {
        console.error("Critical D1 failure in getEarliestSyncDate:", e2);
      }
      return { date: null };
    }
  }

  async getPricesSnapshot(targetDate: string) {
    return await this.db.all(sql`
      WITH RankedChanges AS (
        SELECT 
          station_id, 
          fuel_type, 
          price, 
          is_available, 
          updated_at,
          LAG(price) OVER(PARTITION BY station_id, fuel_type ORDER BY price_date ASC) as prev_price,
          ROW_NUMBER() OVER(PARTITION BY station_id, fuel_type ORDER BY price_date DESC) as rn
        FROM prices
        WHERE price_date <= ${targetDate}
      )
      SELECT 
        s.id as station_id,
        s.brand_id,
        s.name as station_name,
        s.address,
        s.suburb,
        s.state,
        s.postcode,
        s.lat,
        s.lng,
        rc.fuel_type,
        rc.price,
        rc.is_available,
        rc.updated_at,
        rc.prev_price as previous_price
      FROM stations s
      JOIN RankedChanges rc ON s.id = rc.station_id AND rc.rn = 1
    `);
  }
}
