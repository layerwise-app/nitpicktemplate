CREATE TABLE `demo_request_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demo_requests` (
	`id` text PRIMARY KEY,
	`email` text NOT NULL UNIQUE,
	`company` text NOT NULL,
	`team_size` text NOT NULL,
	`code_host` text NOT NULL,
	`owner_notified_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `demo_request_attempts_ip_hash_idx` ON `demo_request_attempts` (`ip_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `demo_request_attempts_created_at_idx` ON `demo_request_attempts` (`created_at`);--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
DROP TABLE `verification`;