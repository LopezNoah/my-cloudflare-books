
import { Prisma, PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { z } from 'astro/zod';
import { bookSchema } from '../../../schemas/books';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const books = await prisma.book.findMany({
      include: { authors: {
        include: {
          author: true // Include the Author model in BookAuthor
        }
      }, genres: {
        include: {
          genre: true // Include the Genre model in BookGenre
        }
      }, readingSessions: true }, // Include related data if needed
    });

    // const flattenedBooks = books.map(book => ({
    //   ...book,
    //   authors: book.authors.map(bookAuthor => bookAuthor.author.name),
    //   genres: book.genres.map(bookGenre => bookGenre.genre.name), // Flatten genres as well for consistency
    // }));

    return new Response(JSON.stringify(books), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch books' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};


export const POST: APIRoute = async ({ request }) => {
    try {
        const requestData = await request.json();
        const validatedData = bookSchema.safeParse(requestData);

        if (!validatedData.success) {
            return new Response(JSON.stringify({
                errors: validatedData.error.issues
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { title, isbn, pageCount, genreIds, authorIds } = validatedData.data; // Include authorIds

        const createData: Prisma.BookCreateInput = {
          title,
          isbn: isbn ?? undefined,
          pageCount: pageCount ?? undefined,
        };

        if (genreIds) {
          createData.genres = {
            connect: genreIds.map((id) => ({ id })),
          };
        }

        if (authorIds) {
          createData.authors = {
            connect: authorIds.map((id) => ({ id })), // Connect authors
          };
        }

        const newBook = await prisma.book.create({
            data: createData,
        });

        return new Response(JSON.stringify(newBook), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error("Prisma Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to create book', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await prisma.$disconnect();
    }
};