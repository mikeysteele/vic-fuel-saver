PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_prices` (
	`station_id` text NOT NULL,
	`fuel_type` text NOT NULL,
	`price` real NOT NULL,
	`is_available` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`station_id`, `fuel_type`, `updated_at`)
);
--> statement-breakpoint
INSERT INTO `__new_prices`("station_id", "fuel_type", "price", "is_available", "updated_at") SELECT "station_id", "fuel_type", "price", "is_available", "updated_at" FROM `prices`;--> statement-breakpoint
DROP TABLE `prices`;--> statement-breakpoint
ALTER TABLE `__new_prices` RENAME TO `prices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `prices_station_id_idx` ON `prices` (`station_id`);--> statement-breakpoint
CREATE INDEX `prices_fuel_type_idx` ON `prices` (`fuel_type`);--> statement-breakpoint
CREATE INDEX `prices_updated_at_idx` ON `prices` (`updated_at`);--> statement-breakpoint
CREATE TABLE `__new_stations` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`suburb` text NOT NULL,
	`state` text NOT NULL,
	`postcode` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_stations`("id", "brand_id", "name", "address", "suburb", "state", "postcode", "lat", "lng") SELECT "id", "brand_id", "name", "address", "suburb", "state", "postcode", "lat", "lng" FROM `stations`;--> statement-breakpoint
DROP TABLE `stations`;--> statement-breakpoint
ALTER TABLE `__new_stations` RENAME TO `stations`;