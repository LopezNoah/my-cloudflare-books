import { PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { readingSessionSchema } from '../../../schemas/books';

export const get: APIRoute = async ({ params, locals }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid reading session ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const readingSession = await prisma.readingSession.findUnique({
      where: { id },
      include: { book: true },
    });
    if (!readingSession) {
      return new Response(JSON.stringify({ error: 'Reading session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(readingSession), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reading session' }), {
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
    return new Response(JSON.stringify({ error: 'Invalid reading session ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const requestData = await request.json();
     const validatedData = readingSessionSchema.safeParse(requestData);
   if (!validatedData.success) {
     return new Response(JSON.stringify({
       errors: validatedData.error.issues
     }), {
       status: 400,
       headers: { 'Content-Type': 'application/json' },
     });
   }

    const { bookId, startTime, duration, pageStart, pageEnd, finishedBook } = validatedData.data;

    const updatedReadingSession = await prisma.readingSession.update({
      where: { id },
      data: {
        bookId,
        startTime: startTime ? new Date(startTime) : undefined, // Update if provided
        duration,
        pageStart,
        pageEnd,
        finishedBook,
      },
    });
    return new Response(JSON.stringify(updatedReadingSession), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to update reading session', details: error.message }), {
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
    return new Response(JSON.stringify({ error: 'Invalid reading session ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    await prisma.readingSession.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ message: 'Reading session deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to delete reading session', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};