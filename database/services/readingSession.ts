import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import { eq, and, isNull, sql } from "drizzle-orm";
type DB = DrizzleD1Database<typeof schema>;

export class ReadingSessionService {
  private db: DB;

  constructor(database: DB) {
    this.db = database;
  }

  async createReadingSession(
    newSession: schema.NewReadingSession
  ): Promise<schema.ReadingSession> {
    return await this.db
      .insert(schema.readingSessions)
      .values(newSession)
      .returning()
      .get();
  }

  async getSessionsForBookRead(
    bookReadId: number
  ): Promise<schema.ReadingSession[]> {
    return await this.db
      .select()
      .from(schema.readingSessions)
      .where(eq(schema.readingSessions.bookReadId, bookReadId))
      .all();
  }

  async getReadingSessionById(
    sessionId: number
  ): Promise<schema.ReadingSession | undefined> {
    const session = await this.db
      .select()
      .from(schema.readingSessions)
      .where(eq(schema.readingSessions.id, sessionId))
      .get();
    return session;
  }

  async updateReadingSession(
    sessionId: number,
    updatedSession: Partial<schema.NewReadingSession>
  ): Promise<schema.ReadingSession> {
    return await this.db
      .update(schema.readingSessions)
      .set(updatedSession)
      .where(eq(schema.readingSessions.id, sessionId))
      .returning()
      .get();
  }

  async deleteReadingSession(sessionId: number) {
    await this.db
      .delete(schema.readingSessions)
      .where(eq(schema.readingSessions.id, sessionId))
      .run();
  }
}
