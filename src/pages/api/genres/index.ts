import { PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { genreSchema } from '../../../schemas/books';

export const GET: APIRoute = async ({ request, locals }) => {

  try {
    const genres = await prisma.genre.findMany();
    return new Response(JSON.stringify(genres), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch genres' }), {
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
    const validatedData = genreSchema.safeParse(requestData);
   if (!validatedData.success) {
     return new Response(JSON.stringify({
       errors: validatedData.error.issues
     }), {
       status: 400,
       headers: { 'Content-Type': 'application/json' },
     });
   }

    const { name } = validatedData.data;

    const genre = await prisma.genre.create({
      data: {
        name,
      },
    });
    return new Response(JSON.stringify(genre), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to create genre', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};