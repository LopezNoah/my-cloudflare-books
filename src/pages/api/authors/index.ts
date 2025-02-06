// api/authors.ts
import type { APIRoute } from 'astro';
// import { prisma } from '../../lib/prisma';
import { prisma } from '../../../lib/prisma';

export const GET: APIRoute = async () => {
  try {
    const authors = await prisma.author.findMany();
    return new Response(JSON.stringify(authors), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch authors' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
};