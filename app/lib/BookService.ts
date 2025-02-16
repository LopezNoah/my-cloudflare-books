import type { AppLoadContext } from "react-router";
import * as schema from "~/database/schema";
import { desc, eq } from "drizzle-orm";
import type {
  Author,
  Book,
  BookAuthor,
  BookGenre,
  Genre,
  ReadingSession,
} from "~/database/schema";
import { z } from "zod";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export type BookWithRelations = Book & {
  bookAuthor: (BookAuthor & { author: Author })[];
  bookGenre: (BookGenre & { genre: Genre })[];
};

export type UpdateBookData = {
  title: string;
  pageCount: number;
  genres: string[];
  authors: string[];
};

export type AddReadingSessionData = {
  startTime: string;
  duration: number;
  pageStart: number;
  pageEnd: number;
  finishedBook: boolean;
  bookId: number;
};

export const updateBookSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }),
  pageCount: z
    .number()
    .int()
    .positive({ message: "Page count must be a positive number" }),
  genres: z.array(
    z.string().trim().min(0, { message: "Genres cannot be empty" })
  ),
  authors: z.array(
    z.string().min(1, { message: "Author name cannot be empty" })
  ),
});

export const addReadingSessionSchema = z.object({
  startTime: z.string(),
  duration: z.coerce
    .number()
    .int()
    .positive({ message: "Duration must be a positive number" }),
  pageStart: z.coerce
    .number()
    .int()
    .positive({ message: "Start page must be a positive number" }),
  pageEnd: z.coerce
    .number()
    .int()
    .positive({ message: "End page must be a positive number" }),
  finishedBook: z.coerce.boolean(),
  bookId: z.coerce.number().int().positive(),
});

export class BookService {
  private db: DrizzleD1Database<typeof schema>;

  constructor(db: DrizzleD1Database<typeof schema>) {
    this.db = db;
  }

  async getBookWithRelations(
    bookId: number
  ): Promise<BookWithRelations | undefined> {
    return await this.db.query.books.findFirst({
      where: eq(schema.books.id, bookId),
      with: {
        bookAuthor: { with: { author: true } },
        bookGenre: { with: { genre: true } },
      },
    });
  }

  async getBook(bookId: number): Promise<Book | undefined> {
    return await this.db.query.books.findFirst({
      where: eq(schema.books.id, bookId),
    });
  }

  async getReadingSessions(bookId: number): Promise<ReadingSession[]> {
    return await this.db
      .select()
      .from(schema.readingSessions)
      .where(eq(schema.readingSessions.bookId, bookId))
      .orderBy(desc(schema.readingSessions.startTime));
  }

  async getNextPageStart(readingSessions: ReadingSession[]): Promise<number> {
    let nextPageStart: number = 1;
    if (readingSessions.length > 0) {
      const maxPageEnd = readingSessions.reduce((maxPage, session) => {
        return session.pageEnd !== null &&
          session.pageEnd !== undefined &&
          session.pageEnd > maxPage
          ? session.pageEnd
          : maxPage;
      }, 0);
      nextPageStart = maxPageEnd + 1;
    }
    return nextPageStart;
  }

  async updateBook(bookId: number, data: UpdateBookData): Promise<void> {
    const result = updateBookSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.message); // Throw a simple error with the Zod error message
    }

    await this.db
      .update(schema.books)
      .set({ title: result.data.title, pageCount: result.data.pageCount })
      .where(eq(schema.books.id, bookId));

    await this.updateBookGenres(bookId, result.data.genres);
  }

  private async updateBookGenres(
    bookId: number,
    genreNames: string[]
  ): Promise<void> {
    await this.db
      .delete(schema.bookGenres)
      .where(eq(schema.bookGenres.bookId, bookId));

    for (const genreName of genreNames) {
      let genre = await this.db.query.genres.findFirst({
        where: (genres, { eq }) => eq(genres.name, genreName),
      });

      if (!genre) {
        const newGenre = await this.db
          .insert(schema.genres)
          .values({ name: genreName })
          .returning()
          .then((results) => results[0]);
        if (!newGenre) throw new Error("Failed to insert genre");
        genre = newGenre;
      }

      await this.db.insert(schema.bookGenres).values({
        bookId: bookId,
        genreId: genre.id,
      });
    }
  }

  private async updateBookAuthors(
    bookId: number,
    authorNames: string[]
  ): Promise<void> {
    await this.db
      .delete(schema.bookAuthors)
      .where(eq(schema.bookAuthors.bookId, bookId));

    for (const authorName of authorNames) {
      let author = await this.db.query.authors.findFirst({
        where: (authors, { eq }) => eq(authors.name, authorName),
      });

      if (!author) {
        const newAuthor = await this.db
          .insert(schema.authors)
          .values({ name: authorName })
          .returning()
          .then((results) => results[0]);
        if (!newAuthor) throw new Error("Failed to insert author");
        author = newAuthor;
      }

      await this.db.insert(schema.bookAuthors).values({
        bookId: bookId,
        authorId: author.id,
      });
    }
  }

  async createBook(data: UpdateBookData): Promise<number> {
    const result = updateBookSchema.safeParse(data);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    const [newBook] = await this.db
      .insert(schema.books)
      .values({
        title: result.data.title,
        pageCount: result.data.pageCount,
      })
      .returning({ insertedId: schema.books.id });
    if (!newBook) throw new Error("Failed to insert book");

    await this.updateBookGenres(newBook.insertedId, result.data.genres);
    await this.updateBookAuthors(newBook.insertedId, result.data.authors);

    return newBook.insertedId;
  }

  async addReadingSession(data: AddReadingSessionData): Promise<void> {
    const result = addReadingSessionSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.message); // Throw a simple error with the Zod error message
    }

    await this.db.insert(schema.readingSessions).values(result.data);
  }
}
