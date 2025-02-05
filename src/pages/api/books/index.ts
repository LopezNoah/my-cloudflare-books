import { PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const get: APIRoute = async ({ request, locals }) => {
  try {
    const books = await prisma.book.findMany({
      include: { genres: true, readingSessions: true }, // Include related data if needed
    });
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

export const post: APIRoute = async ({ request, locals }) => {
  try {
    const requestData = await request.json();
    const { title, authors, isbn, pageCount } = requestData;

    const book = await prisma.book.create({
      data: {
        title,
        authors,
        isbn,
        pageCount,
      },
    });
    return new Response(JSON.stringify(book), {
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

// export const onRequest = defineEventHandler(async (event) => {
//   event.locals.runtime = event.context.cloudflare;
// });

// function defineEventHandler(func: any) {
//   return func;
// }