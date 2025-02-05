import { PrismaClient } from '@prisma/client';
import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { genreSchema } from '../../../schemas/books';

export const get: APIRoute = async ({ params, locals }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid genre ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const genre = await prisma.genre.findUnique({
      where: { id },
    });
    if (!genre) {
      return new Response(JSON.stringify({ error: 'Genre not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(genre), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch genre' }), {
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
    return new Response(JSON.stringify({ error: 'Invalid genre ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
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

    const updatedGenre = await prisma.genre.update({
      where: { id },
      data: {
        name,
      },
    });
    return new Response(JSON.stringify(updatedGenre), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to update genre', details: error.message }), {
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
    return new Response(JSON.stringify({ error: 'Invalid genre ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    await prisma.genre.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ message: 'Genre deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to delete genre', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};