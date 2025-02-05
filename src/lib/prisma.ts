// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
export const prisma  = new PrismaClient();

/*
const globalForPrisma = globalThis  as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (import.meta.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
*/