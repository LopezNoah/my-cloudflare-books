import { Prisma, PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { bookSchema } from '../../../schemas/books';

export const GET: APIRoute = async ({ params, locals }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid book ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: { authors: {
        include: {
          author: true // Include the Author model in BookAuthor
        }
      }, genres: {
        include: {
          genre: true // Include the Genre model in BookGenre
        }
      }, readingSessions: true },
    });
    if (!book) {
      return new Response(JSON.stringify({ error: 'Book not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const flattenedBook = {
      ...book,
      authors: book.authors.map(bookAuthor => bookAuthor.author.name),
      genres: book.genres.map(bookGenre => bookGenre.genre.name), // Flatten genres as well for consistency
    };
    return new Response(JSON.stringify(flattenedBook), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch book' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid book ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
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

    const updateData: Prisma.BookUpdateInput = {
      title,
      isbn: isbn ?? undefined,
      pageCount: pageCount ?? undefined,
    };

   // --- Authors ---
    if (authorIds) {
      updateData.authors = {
        // 1. Delete existing associations:
        deleteMany: {}, // Delete *all* existing BookAuthor entries for this book.
        // 2. Create new associations:
        createMany: {
          data: authorIds.map((authorId) => ({ authorId })), // Create new BookAuthor entries.
        },
      };
    } else {
        updateData.authors = {
            deleteMany: {}
        }
    }

    // --- Genres ---
    if (genreIds) {
        updateData.genres = {
            deleteMany: {},
            createMany: {
              data: genreIds.map((genreId) => ({ genreId })),
            },
        };
    } else {
        updateData.genres = {
            deleteMany: {},
        }
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedBook), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to update book', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid book ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    await prisma.book.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ message: 'Book deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to delete book', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};