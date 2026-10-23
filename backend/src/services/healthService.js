// ============================================================
// services/healthService.js
//
// SERVICE LAYER
// Resolvers stay thin. They call this file; this file talks to Prisma.
// ============================================================

import { db } from '../db/index.js';

export async function getHealthStatus() {
  let database = {
    connected: false,
    users: 0,
    workspaces: 0,
    apis: 0,
    endpoints: 0,
  };

  try {
    // A cheap query: if Postgres is down, this throws.
    await db.$queryRaw`SELECT 1`;
    database = {
      connected: true,
      users: await db.user.count(),
      workspaces: await db.workspace.count(),
      apis: await db.api.count(),
      endpoints: await db.apiEndpoint.count(),
    };
  } catch (err) {
    database.connected = false;
  }

  return {
    status: database.connected ? 'ok' : 'degraded',
    message: database.connected
      ? 'DevAPI backend is running and Postgres is reachable'
      : 'Backend is up but Postgres is not reachable',
    phase: 4,
    timestamp: new Date().toISOString(),
    database,
  };
}

export function getProjectInfo() {
  return {
    name: 'DevAPI',
    phase: 'GraphQL catalog — nested API documentation',
    description:
      'Ask GraphQL for only the fields you need: workspace → APIs → endpoints → parameters, all in one request.',
  };
}
