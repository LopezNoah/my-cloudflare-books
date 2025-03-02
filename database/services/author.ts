import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { eq, and, isNull, sql } from "drizzle-orm";
type DB = DrizzleD1Database<typeof schema>;

export class AuthorService {
  private db: DB;

  constructor(database: DB) {
    this.db = database;
  }
  async getAllAuthors(): Promise<schema.Author[]> {
    return await this.db.select().from(schema.authors).all();
  }
  async createAuthor(newAuthor: schema.NewAuthor): Promise<schema.Author> {
    return await this.db
      .insert(schema.authors)
      .values(newAuthor)
      .returning()
      .get();
  }

  async getAuthorById(authorId: number): Promise<schema.Author | undefined> {
    const author = await this.db
      .select()
      .from(schema.authors)
      .where(eq(schema.authors.id, authorId))
      .get();
    return author;
  }
}
