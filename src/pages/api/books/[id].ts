import { PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const get: APIRoute = async ({ params, locals }) => {
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
      include: { genres: true, readingSessions: true },
    });
    if (!book) {
      return new Response(JSON.stringify({ error: 'Book not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(book), {
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

export const put: APIRoute = async ({ params, request, locals }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid book ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const requestData = await request.json();
    const { title, authors, isbn, pageCount } = requestData;

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title,
        authors,
        isbn,
        pageCount,
      },
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

export const del: APIRoute = async ({ params, locals }) => {
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