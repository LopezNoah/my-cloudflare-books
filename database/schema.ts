import {
  sqliteTable,
  integer,
  text,
  // primaryKey,
  // index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
// import { sql } from "drizzle-orm";

export const books = sqliteTable("Book", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  isbn: text("isbn"),
  pageCount: integer("pageCount"),
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

export const readingSessions = sqliteTable("ReadingSession", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("bookId")
    .notNull()
    .references(() => books.id),
  startTime: text("startTime").notNull(), // Store as ISO string
  duration: integer("duration").notNull(),
  pageStart: integer("pageStart"),
  pageEnd: integer("pageEnd"),
  finishedBook: integer("finishedBook", { mode: "boolean" }).default(false),
});

export const bookRelations = relations(books, ({ one, many }) => ({
  bookAuthor: many(bookAuthors),
  bookGenre: many(bookGenres),
  readingSessions: many(readingSessions),
}));

export const readingSessionsRelations = relations(
  readingSessions,
  ({ one }) => ({
    book: one(books),
  })
);

export const authorRelations = relations(authors, ({ one, many }) => ({
  bookAuthor: many(bookAuthors),
}));

export const genreRelations = relations(genres, ({ one, many }) => ({
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

// Type helpers for better type safety
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
