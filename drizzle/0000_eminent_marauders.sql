CREATE TABLE `prices` (
	`station_id` integer NOT NULL,
	`fuel_type` text NOT NULL,
	`price` real NOT NULL,
	`is_available` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`station_id`, `fuel_type`, `updated_at`)
);
--> statement-breakpoint
CREATE INDEX `prices_station_id_idx` ON `prices` (`station_id`);--> statement-breakpoint
CREATE INDEX `prices_fuel_type_idx` ON `prices` (`fuel_type`);--> statement-breakpoint
CREATE INDEX `prices_updated_at_idx` ON `prices` (`updated_at`);--> statement-breakpoint
CREATE TABLE `stations` (
	`id` integer PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`suburb` text NOT NULL,
	`state` text NOT NULL,
	`postcode` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL
);
