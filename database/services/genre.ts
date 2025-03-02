import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { eq, and, isNull, sql } from "drizzle-orm";
type DB = DrizzleD1Database<typeof schema>;

export class GenreService {
  private db: DB;
  constructor(database: DB) {
    this.db = database;
  }
  async getAllGenres(): Promise<schema.Genre[]> {
    return await this.db.select().from(schema.genres).all();
  }

  async createGenre(newGenre: schema.NewGenre): Promise<schema.Genre> {
    return await this.db
      .insert(schema.genres)
      .values(newGenre)
      .returning()
      .get();
  }

  async getGenreById(genreId: number): Promise<schema.Genre | undefined> {
    const genre = await this.db
      .select()
      .from(schema.genres)
      .where(eq(schema.genres.id, genreId))
      .get();
    return genre;
  }
}
