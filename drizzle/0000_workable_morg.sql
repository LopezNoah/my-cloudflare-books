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
CREATE TABLE `Book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`isbn` text,
	`pageCount` integer
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
	`bookId` integer NOT NULL,
	`startTime` text NOT NULL,
	`duration` integer NOT NULL,
	`pageStart` integer,
	`pageEnd` integer,
	`finishedBook` integer DEFAULT false,
	FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON UPDATE no action ON DELETE no action
);
