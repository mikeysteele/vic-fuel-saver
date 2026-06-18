-- Migration: Deduplicate prices to one row per station/fuel/day
-- The old PK (station_id, fuel_type, synced_at) stored a full snapshot every 4hr sync,
-- bloating the table to 1.6M rows. The new PK (station_id, fuel_type, price_date) keeps
-- only the latest price per day, reducing to ~205K rows.

DROP TABLE IF EXISTS __new_prices;

CREATE TABLE `__new_prices` (
  `station_id`   TEXT NOT NULL,
  `fuel_type`    TEXT NOT NULL,
  `price_date`   TEXT NOT NULL,
  `price`        REAL NOT NULL,
  `is_available` INTEGER NOT NULL,
  `updated_at`   TEXT NOT NULL,
  `synced_at`    TEXT NOT NULL,
  PRIMARY KEY(`station_id`, `fuel_type`, `price_date`)
);

-- For each (station_id, fuel_type, day), keep the row with the latest updated_at
INSERT INTO `__new_prices` (`station_id`, `fuel_type`, `price_date`, `price`, `is_available`, `updated_at`, `synced_at`)
  SELECT `station_id`, `fuel_type`, date(`updated_at`), `price`, `is_available`, MAX(`updated_at`), MAX(`synced_at`)
  FROM `prices`
  GROUP BY `station_id`, `fuel_type`, date(`updated_at`);

DROP TABLE `prices`;
ALTER TABLE `__new_prices` RENAME TO `prices`;

CREATE INDEX `prices_station_id_idx` ON `prices` (`station_id`);
CREATE INDEX `prices_fuel_type_idx` ON `prices` (`fuel_type`);
CREATE INDEX `prices_price_date_idx` ON `prices` (`price_date`);
