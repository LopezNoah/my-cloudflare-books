// my-cloudflare-books/database/schema.ts
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const books = sqliteTable("Book", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  isbn: text("isbn"),
  pageCount: integer("pageCount"),
  author: text("author").notNull().default("Unknown"),
  genre: text("genre"),
  userId: text("userId"), // Keep userId for potential future use with Clerk
});

export const genres = sqliteTable("Genre", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const authors = sqliteTable("Author", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const bookGenres = sqliteTable("BookGenre", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("bookId")
    .notNull()
    .references(() => books.id),
  genreId: integer("genreId")
    .notNull()
    .references(() => genres.id),
});

export const bookAuthors = sqliteTable("BookAuthor", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("bookId")
    .notNull()
    .references(() => books.id),
  authorId: integer("authorId")
    .notNull()
    .references(() => authors.id),
});

// New table to represent a single "read-through" of a book
export const bookReads = sqliteTable("BookRead", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("bookId")
    .notNull()
    .references(() => books.id),
  userId: text("userId").notNull(), // Associate the read with a user
  startedAt: text("startedAt"), // ISO string
  finishedAt: text("finishedAt"), // ISO string, NULL if not finished
  abandoned: integer("abandoned", { mode: "boolean" }).default(false),
  status: text("status", {
    enum: ["to-read", "reading", "finished", "dnf", "abandoned"],
  })
    .notNull()
    .default("to-read"),
});

export const readingSessions = sqliteTable("ReadingSession", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookReadId: integer("bookReadId") // Link to BookRead, not directly to Book
    .notNull()
    .references(() => bookReads.id),
  startTime: text("startTime").notNull(), // Store as ISO string
  duration: integer("duration").notNull(),
  pageStart: integer("pageStart").notNull(),
  pageEnd: integer("pageEnd").notNull(),
  notes: text("notes"),
});

// User Subscriptions (Stripe Integration)
export const userSubscriptions = sqliteTable("UserSubscription", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  stripeSubscriptionId: text("stripeSubscriptionId").notNull(), // Store the Stripe subscription ID
  plan: text("plan").notNull(), // e.g., "basic", "premium"  -  Corresponds to a Stripe Price ID.
  currentPeriodStart: text("currentPeriodStart").notNull(), // ISO string
  currentPeriodEnd: text("currentPeriodEnd").notNull(), // ISO string
  booksReadThisPeriod: integer("booksReadThisPeriod").notNull().default(0), // Counter for the current period
  status: text("status").notNull(), // e.g., 'active', 'canceled', 'incomplete', 'past_due'. See: https://stripe.com/docs/api/subscriptions/object#subscription_object-status
});

export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  earnedAt: integer("earned_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const bookRelations = relations(books, ({ many }) => ({
  bookAuthor: many(bookAuthors),
  bookGenre: many(bookGenres),
  bookReads: many(bookReads), // Relation to BookRead
}));

export const bookReadRelations = relations(bookReads, ({ many, one }) => ({
  book: one(books, {
    fields: [bookReads.bookId],
    references: [books.id],
  }),
  readingSessions: many(readingSessions), // Sessions belong to a BookRead
}));

export const readingSessionsRelations = relations(
  readingSessions,
  ({ one }) => ({
    bookRead: one(bookReads, {
      // Relation to BookRead
      fields: [readingSessions.bookReadId],
      references: [bookReads.id],
    }),
  })
);

export const authorRelations = relations(authors, ({ many }) => ({
  bookAuthor: many(bookAuthors),
}));

export const genreRelations = relations(genres, ({ many }) => ({
  bookGenre: many(bookGenres),
}));

export const booksToGenreRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, {
    fields: [bookGenres.bookId],
    references: [books.id],
  }),
  genre: one(genres, {
    fields: [bookGenres.genreId],
    references: [genres.id],
  }),
}));

export const booksToAuthorRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookAuthors.authorId],
    references: [authors.id],
  }),
}));

export const userSubscriptionRelations = relations(
  userSubscriptions,
  ({ one }) => ({
    //  Potentially add a relation to a User table if you create one later
  })
);

// Type helpers
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type ReadingSession = typeof readingSessions.$inferSelect;
export type NewReadingSession = typeof readingSessions.$inferInsert;
export type BookGenre = typeof bookGenres.$inferSelect;
export type NewBookGenre = typeof bookGenres.$inferInsert;
export type BookAuthor = typeof bookAuthors.$inferSelect;
export type NewBookAuthor = typeof bookAuthors.$inferInsert;
export type BookRead = typeof bookReads.$inferSelect;
export type NewBookRead = typeof bookReads.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
