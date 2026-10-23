// ============================================================
// db/index.js
//
// Single Prisma client for the whole backend.
// Import `db` from here — do not call `new PrismaClient()` in
// resolvers or services.
//
//   import { db } from '../db/index.js';
//   const users = await db.user.findMany();
// ============================================================

import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export async function disconnectDb() {
  await db.$disconnect();
}
