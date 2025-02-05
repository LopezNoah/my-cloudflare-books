import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  authors: z.array(z.string()).optional().default([]), // Authors is still handled as string array in form, optional for now
  isbn: z.string().optional(),
  pageCount: z.number().int().positive().optional(),
});

export type BookSchemaType = z.infer<typeof bookSchema>;

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