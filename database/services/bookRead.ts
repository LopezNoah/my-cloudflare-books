import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import type { InferSelectModel } from "drizzle-orm";
import { eq, and, isNull, sql } from "drizzle-orm";
type DB = DrizzleD1Database<typeof schema>;

export class BookReadService {
  private db: DB;

  constructor(database: DB) {
    this.db = database;
  }
  async getCurrentlyReadingBooks(
    userId: string
  ): Promise<InferSelectModel<typeof schema.books>[]> {
    // Get unfinished BookReads for the user.
    const unfinishedBookReads = await this.db
      .select()
      .from(schema.bookReads)
      .where(
        and(
          eq(schema.bookReads.userId, userId),
          isNull(schema.bookReads.finishedAt)
        )
      )
      .all();

    // Extract the bookIds.  Use a Set to avoid duplicates.
    const bookIds = [...new Set(unfinishedBookReads.map((br) => br.bookId))];

    // Get the book details for those bookIds.
    if (bookIds.length === 0) return [];

    const books = await this.db
      .select()
      .from(schema.books)
      .where(sql`${schema.books.id} in (${bookIds.join(",")})`)
      .all();
    return books;
  }

  async startReadingBook(
    userId: string,
    bookId: number,
    startedAt: string
  ): Promise<schema.BookRead> {
    const newBookRead: schema.NewBookRead = {
      userId,
      bookId,
      startedAt,
      finishedAt: null, // Explicitly set to null
      abandoned: false,
    };

    return await this.db
      .insert(schema.bookReads)
      .values(newBookRead)
      .returning()
      .get();
  }

  async finishReadingBook(
    bookReadId: number,
    finishedAt: string
  ): Promise<schema.BookRead> {
    return await this.db
      .update(schema.bookReads)
      .set({ finishedAt, abandoned: false })
      .where(eq(schema.bookReads.id, bookReadId))
      .returning()
      .get();
  }

  async abandonReadingBook(bookReadId: number): Promise<schema.BookRead> {
    return await this.db
      .update(schema.bookReads)
      .set({ abandoned: true, finishedAt: new Date().toISOString() })
      .where(eq(schema.bookReads.id, bookReadId))
      .returning()
      .get();
  }

  async getBookReadById(
    bookReadId: number
  ): Promise<schema.BookRead | undefined> {
    const bookRead = await this.db
      .select()
      .from(schema.bookReads)
      .where(eq(schema.bookReads.id, bookReadId))
      .get();
    return bookRead;
  }

  async getBookReadsByUserId(userId: string): Promise<schema.BookRead[]> {
    return await this.db
      .select()
      .from(schema.bookReads)
      .where(eq(schema.bookReads.userId, userId))
      .all();
  }
}
