-- Migration: Add synced_at column to prices for proper historical snapshots
-- The old primary key was (station_id, fuel_type, updated_at) where updated_at comes
-- from the API. Since most prices don't change, onConflictDoNothing would skip them.
-- Adding synced_at (our sync time) as part of the key means every sync creates a full snapshot.

-- Drop old prices table and recreate with synced_at
DROP TABLE IF EXISTS prices;

CREATE TABLE `prices` (
  `station_id` text NOT NULL,
  `fuel_type` text NOT NULL,
  `price` real NOT NULL,
  `is_available` integer NOT NULL,
  `updated_at` text NOT NULL,
  `synced_at` text NOT NULL,
  PRIMARY KEY(`station_id`, `fuel_type`, `synced_at`)
);

CREATE INDEX `prices_station_id_idx` ON `prices` (`station_id`);
CREATE INDEX `prices_fuel_type_idx` ON `prices` (`fuel_type`);
CREATE INDEX `prices_synced_at_idx` ON `prices` (`synced_at`);
