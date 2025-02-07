import type { Prisma } from '@prisma/client';
import { z } from 'zod';

export const bookSchema = z.object({
    title: z.string().min(1),
    isbn: z.string().optional(),
    pageCount: z.number().optional(),
    genreIds: z.array(z.number()).optional(),
    authorIds: z.array(z.number()).optional(), // Add authorIds
  });

export type BookSchemaType = z.infer<typeof bookSchema>;
const include = {
    genres: {
        include: {
        genre: true
      },
    },
    authors: {
        include: {
            author: true
        }
    }
  };
  
  export type Book = Prisma.BookGetPayload<{include: typeof include}>;

export const genreSchema = z.object({
    name: z.string().min(1, { message: "Genre name is required" }),
  });
  
  export type GenreSchemaType = z.infer<typeof genreSchema>;

  export const readingSessionSchema = z.object({
    bookId: z.number().int().positive({ message: "Book ID must be a positive integer" }),
    startTime: z.string().datetime({ message: "Invalid start time format" }), // Expecting ISO datetime string
    duration: z.number().int().positive({ message: "Duration must be a positive integer" }),
    pageStart: z.number().int().positive().optional(),
    pageEnd: z.number().int().positive().optional(),
    finishedBook: z.boolean().optional().default(false),
  });
  
  export type ReadingSessionSchemaType = z.infer<typeof readingSessionSchema>;