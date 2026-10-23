// ============================================================
// index.js  — this is the process entry point
//
// Run:  npm run dev   (from the backend folder)
// ============================================================

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { createApp } from './app.js';
import { db, disconnectDb } from './db/index.js';

async function start() {
  // Fail fast if Postgres is down or DATABASE_URL is wrong
  await db.$connect();
  logger.info('Connected to PostgreSQL');

  const { httpServer } = await createApp();

  httpServer.listen(env.port, () => {
    logger.info(`Backend listening on http://localhost:${env.port}`);
    logger.info(`GraphQL endpoint:   http://localhost:${env.port}/graphql`);
    logger.info(`Health check:       http://localhost:${env.port}/health`);
    logger.info('Current phase:      GraphQL catalog + dashboard');
  });
}

async function shutdown() {
  await disconnectDb();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
