// ============================================================
// app.js
//
// Builds the Express app and attaches Apollo Server at /graphql.
//
// Architecture:
//   React → Apollo Client → GraphQL → Express + Apollo Server
//         → Resolvers → Service layer → Prisma → PostgreSQL
//
// Phase 1 stops at Resolvers → Service. Prisma comes in Phase 2.
// ============================================================

import http from 'http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { env } from './config/env.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers/index.js';
import { createLoaders } from './loaders/index.js';
import { getUserFromAuthHeader } from './auth/requireUser.js';

export async function createApp() {
  const app = express();

  // http.Server is needed so Apollo can shut down cleanly on Ctrl+C
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );

  // Simple non-GraphQL ping so you can open http://localhost:4000/health in a browser
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'devapi-backend' });
  });

  // All GraphQL requests go here: POST http://localhost:4000/graphql
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      // Every GraphQL request gets a fresh context:
      //   user    → from JWT (null if not logged in)
      //   loaders → DataLoader batching for this request only
      context: async ({ req }) => ({
        requestId: req.headers['x-request-id'] || null,
        user: await getUserFromAuthHeader(req.headers.authorization),
        loaders: createLoaders(),
      }),
    })
  );

  return { app, httpServer };
}
