import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";
import { eq, and, isNull, sql } from "drizzle-orm";

type DB = DrizzleD1Database<typeof schema>;

import { BookService } from "./services/book";
import { BookReadService } from "./services/bookRead";
import { ReadingSessionService } from "./services/readingSession";
import { AuthorService } from "./services/author";
import { GenreService } from "./services/genre";
export {
  BookService,
  BookReadService,
  ReadingSessionService,
  AuthorService,
  GenreService,
};

export class UserSubscriptionService {
  private db: DB;

  constructor(database: DB) {
    this.db = database;
  }
  async getSubscriptionByUserId(
    userId: string
  ): Promise<schema.UserSubscription | undefined> {
    return await this.db
      .select()
      .from(schema.userSubscriptions)
      .where(eq(schema.userSubscriptions.userId, userId))
      .get();
  }

  async createOrUpdateSubscription(
    subscription: schema.NewUserSubscription
  ): Promise<schema.UserSubscription> {
    // Check if a subscription already exists for this user
    const existingSubscription = await this.getSubscriptionByUserId(
      subscription.userId
    );

    if (existingSubscription) {
      return await this.db
        .update(schema.userSubscriptions)
        .set(subscription)
        .where(eq(schema.userSubscriptions.userId, subscription.userId))
        .returning()
        .get();
    } else {
      return await this.db
        .insert(schema.userSubscriptions)
        .values(subscription)
        .returning()
        .get();
    }
  }
  async updateBooksReadThisPeriod(
    userId: string,
    booksRead: number
  ): Promise<schema.UserSubscription> {
    return await this.db
      .update(schema.userSubscriptions)
      .set({ booksReadThisPeriod: booksRead })
      .where(eq(schema.userSubscriptions.userId, userId))
      .returning()
      .get();
  }
}
