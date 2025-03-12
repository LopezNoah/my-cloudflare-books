CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Author` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `BookAuthor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookId` integer NOT NULL,
	`authorId` integer NOT NULL,
	FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorId`) REFERENCES `Author`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BookGenre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookId` integer NOT NULL,
	`genreId` integer NOT NULL,
	FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`genreId`) REFERENCES `Genre`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BookRead` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookId` integer NOT NULL,
	`userId` text NOT NULL,
	`startedAt` text,
	`finishedAt` text,
	`abandoned` integer DEFAULT false,
	`status` text DEFAULT 'to-read' NOT NULL,
	FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`isbn` text,
	`pageCount` integer,
	`author` text DEFAULT 'Unknown' NOT NULL,
	`genre` text,
	`userId` text
);
--> statement-breakpoint
CREATE TABLE `Genre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Genre_name_unique` ON `Genre` (`name`);--> statement-breakpoint
CREATE TABLE `ReadingSession` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookReadId` integer NOT NULL,
	`startTime` text NOT NULL,
	`duration` integer NOT NULL,
	`pageStart` integer NOT NULL,
	`pageEnd` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`bookReadId`) REFERENCES `BookRead`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` integer NOT NULL,
	`earned_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `UserSubscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`stripeSubscriptionId` text NOT NULL,
	`plan` text NOT NULL,
	`currentPeriodStart` text NOT NULL,
	`currentPeriodEnd` text NOT NULL,
	`booksReadThisPeriod` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL
);
