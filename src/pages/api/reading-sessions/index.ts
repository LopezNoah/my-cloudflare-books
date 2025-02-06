import { PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { readingSessionSchema } from '../../../schemas/books';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const readingSessions = await prisma.readingSession.findMany({
      include: { book: true }, // Include book details
    });
    return new Response(JSON.stringify(readingSessions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reading sessions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
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

    const readingSession = await prisma.readingSession.create({
      data: {
        bookId,
        startTime: new Date(startTime), // Parse startTime as Date
        duration,
        pageStart,
        pageEnd,
        finishedBook,
      },
    });
    return new Response(JSON.stringify(readingSession), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to create reading session', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};