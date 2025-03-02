import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { eq, and, isNull, sql } from "drizzle-orm";
type DB = DrizzleD1Database<typeof schema>;

export class BookService {
  private db: DB;

  constructor(database: DB) {
    this.db = database;
  }

  async getBooks() {
    return await this.db.select().from(schema.books).all();
  }

  async getBookById(id: number) {
    return await this.db
      .select()
      .from(schema.books)
      .where(eq(schema.books.id, id))
      .get();
  }

  async createBook(newBook: schema.NewBook) {
    return await this.db.insert(schema.books).values(newBook).returning().get();
  }

  async updateBook(bookId: number, updatedBook: Partial<schema.NewBook>) {
    return await this.db
      .update(schema.books)
      .set(updatedBook)
      .where(eq(schema.books.id, bookId))
      .returning()
      .get();
  }

  async deleteBook(bookId: number) {
    await this.db.delete(schema.books).where(eq(schema.books.id, bookId)).run();
  }
}
