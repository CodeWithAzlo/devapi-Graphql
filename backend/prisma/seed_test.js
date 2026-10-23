// ============================================================
// prisma/seed_test.js
//
// Public demo data. This is the file a clone runs.
// Password for both accounts: Dev@123
//   test@gmail.com   owner of Acme Shop
//   test2@gmail.com  admin on Acme Shop, owner of Payments
//
// Run from the backend folder:
//   npm run prisma:seed
//
// Safe to run more than once — it wipes DevAPI tables first.
// Your personal seed (seed.js) stays on your machine and is gitignored.
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const db = new PrismaClient();

async function main() {
  console.log('[seed] Clearing old rows…');

  // Child tables first so foreign keys do not block the delete.
  await db.apiChange.deleteMany();
  await db.apiChangelog.deleteMany();
  await db.apiExample.deleteMany();
  await db.apiSchema.deleteMany();
  await db.apiParameter.deleteMany();
  await db.apiEndpoint.deleteMany();
  await db.apiVersion.deleteMany();
  await db.api.deleteMany();
  await db.workspaceMember.deleteMany();
  await db.workspace.deleteMany();
  await db.user.deleteMany();

  console.log('[seed] Creating users (password: Dev@123)…');

  const passwordHash = await bcrypt.hash('Dev@123', 10);

  const azlo = await db.user.create({
    data: {
      email: 'test@gmail.com',
      name: 'Test Owner',
      passwordHash,
    },
  });

  const hamdan = await db.user.create({
    data: {
      email: 'test2@gmail.com',
      name: 'Test Admin',
      passwordHash,
    },
  });

  console.log('[seed] Creating workspace + members…');

  const workspace = await db.workspace.create({
    data: {
      name: 'Acme Shop',
      slug: 'acme-shop',
      description: 'Demo workspace for the Shop HTTP API.',
      ownerId: azlo.id,
      members: {
        create: [
          { userId: azlo.id, role: 'OWNER' },
          { userId: hamdan.id, role: 'ADMIN' },
        ],
      },
    },
  });

  console.log('[seed] Creating Shop API with v1 and v2…');

  const api = await db.api.create({
    data: {
      workspaceId: workspace.id,
      name: 'Shop API',
      description: 'Customers, orders, and catalog.',
      baseUrl: 'https://api.acme-shop.example',
    },
  });

  // ----- v1: published, older contract -----
  const v1 = await db.apiVersion.create({
    data: {
      apiId: api.id,
      version: 'v1',
      status: 'PUBLISHED',
      isCurrent: false,
      notes: 'First public release.',
      publishedAt: new Date('2025-01-15'),
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v1.id,
      method: 'GET',
      path: '/users/:id',
      summary: 'Get a user by id',
      description: 'Returns a single customer.',
      parameters: {
        create: [
          {
            name: 'id',
            location: 'PATH',
            type: 'string',
            required: true,
            description: 'User id',
            example: 'usr_123',
          },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: 'User',
            statusCode: 200,
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Default',
            statusCode: 200,
            request: { path: { id: 'usr_123' } },
            response: {
              id: 'usr_123',
              name: 'John',
              username: 'john',
              email: 'john@example.com',
            },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v1.id,
      method: 'GET',
      path: '/users',
      summary: 'List users',
      parameters: {
        create: [
          { name: 'limit', location: 'QUERY', type: 'integer', required: false, example: '10' },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: 'UserList',
            statusCode: 200,
            schema: { type: 'array', items: { type: 'object' } },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v1.id,
      method: 'POST',
      path: '/users',
      summary: 'Create a user',
      schemas: {
        create: [
          {
            kind: 'REQUEST',
            name: 'CreateUser',
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        ],
      },
    },
  });

  // ----- v2: current — some breaking changes vs v1 -----
  const v2 = await db.apiVersion.create({
    data: {
      apiId: api.id,
      version: 'v2',
      status: 'PUBLISHED',
      isCurrent: true,
      notes: 'Breaking: removed GET /users/:id, email is now required.',
      publishedAt: new Date('2025-06-01'),
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v2.id,
      method: 'GET',
      path: '/users',
      summary: 'List users',
      parameters: {
        create: [
          { name: 'page', location: 'QUERY', type: 'integer', required: false, example: '1' },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: 'UserList',
            statusCode: 200,
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v2.id,
      method: 'POST',
      path: '/users',
      summary: 'Create a user',
      schemas: {
        create: [
          {
            kind: 'REQUEST',
            name: 'CreateUser',
            schema: {
              type: 'object',
              required: ['name', 'email'],
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v2.id,
      method: 'POST',
      path: '/orders',
      summary: 'Create an order',
      description: 'New in v2.',
      schemas: {
        create: [
          {
            kind: 'REQUEST',
            name: 'CreateOrder',
            schema: {
              type: 'object',
              required: ['userId', 'items'],
              properties: {
                userId: { type: 'integer' },
                items: { type: 'array' },
              },
            },
          },
          {
            kind: 'RESPONSE',
            name: 'Order',
            statusCode: 201,
            schema: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                createdAt: { type: 'string' },
              },
            },
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Simple order',
            statusCode: 201,
            request: { userId: 123, items: [{ sku: 'tee-black', qty: 1 }] },
            response: { id: 9001, createdAt: '2025-06-01T10:00:00Z' },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: v2.id,
      method: 'GET',
      path: '/orders/:id',
      summary: 'Get an order',
      description: 'Fetch a single order by id.',
      parameters: {
        create: [
          {
            name: 'id',
            location: 'PATH',
            type: 'integer',
            required: true,
            example: '9001',
          },
          {
            name: 'Authorization',
            location: 'HEADER',
            type: 'string',
            required: true,
            example: 'Bearer <token>',
          },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: 'Order',
            statusCode: 200,
            schema: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                status: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
          {
            kind: 'RESPONSE',
            name: 'NotFound',
            statusCode: 404,
            schema: { type: 'object', properties: { error: { type: 'string' } } },
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Found',
            statusCode: 200,
            request: { path: { id: 9001 } },
            response: { id: 9001, userId: 123, status: 'paid', createdAt: '2025-06-01T10:00:00Z' },
          },
        ],
      },
    },
  });

  console.log('[seed] Creating v1 → v2 change rows + changelog…');

  await db.apiChange.createMany({
    data: [
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'ENDPOINT_REMOVED',
        severity: 'BREAKING',
        summary: 'Removed GET /users/:id',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'FIELD_REMOVED',
        severity: 'BREAKING',
        summary: 'Removed response field "username"',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'REQUIRED_CHANGED',
        severity: 'BREAKING',
        summary: 'Changed "email" from optional to required',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'TYPE_CHANGED',
        severity: 'BREAKING',
        summary: 'Changed "id" from String to Integer',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'ENDPOINT_ADDED',
        severity: 'NON_BREAKING',
        summary: 'Added POST /orders',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'FIELD_ADDED',
        severity: 'NON_BREAKING',
        summary: 'Added response field "createdAt"',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'PARAMETER_REMOVED',
        severity: 'POTENTIALLY_BREAKING',
        summary: 'Removed query parameter "limit"',
      },
      {
        fromVersionId: v1.id,
        toVersionId: v2.id,
        changeType: 'PARAMETER_ADDED',
        severity: 'NON_BREAKING',
        summary: 'Added query parameter "page"',
      },
    ],
  });

  await db.apiChangelog.create({
    data: {
      versionId: v2.id,
      title: 'Version 2.0.0',
      body: `Breaking Changes
- Removed GET /users/:id
- Changed email field to required
- Changed id from String to Integer
- Removed response field username

Added
- POST /orders
- GET /orders/:id
- Response field createdAt
- Query parameter page`,
    },
  });

  console.log('[seed] Creating Payments workspace…');

  const paymentsWs = await db.workspace.create({
    data: {
      name: 'Payments',
      slug: 'payments',
      description: 'Card charges and refunds.',
      ownerId: hamdan.id,
      members: {
        create: [
          { userId: hamdan.id, role: 'OWNER' },
          { userId: azlo.id, role: 'ADMIN' },
        ],
      },
    },
  });

  const payApi = await db.api.create({
    data: {
      workspaceId: paymentsWs.id,
      name: 'Payments API',
      description: 'Create charges and look up payment status.',
      baseUrl: 'https://api.payments.example',
    },
  });

  const payV1 = await db.apiVersion.create({
    data: {
      apiId: payApi.id,
      version: 'v1',
      status: 'PUBLISHED',
      isCurrent: true,
      notes: 'Initial payments surface.',
      publishedAt: new Date('2025-03-01'),
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: payV1.id,
      method: 'POST',
      path: '/charges',
      summary: 'Create a charge',
      parameters: {
        create: [
          {
            name: 'Authorization',
            location: 'HEADER',
            type: 'string',
            required: true,
            example: 'Bearer pk_test_123',
          },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'REQUEST',
            name: 'CreateCharge',
            schema: {
              type: 'object',
              required: ['amount', 'currency'],
              properties: {
                amount: { type: 'integer' },
                currency: { type: 'string' },
                customerId: { type: 'string' },
              },
            },
          },
          {
            kind: 'RESPONSE',
            name: 'Charge',
            statusCode: 201,
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                amount: { type: 'integer' },
                status: { type: 'string' },
              },
            },
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'USD charge',
            statusCode: 201,
            request: { amount: 1999, currency: 'usd', customerId: 'cus_1' },
            response: { id: 'ch_abc', amount: 1999, status: 'succeeded' },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: payV1.id,
      method: 'GET',
      path: '/charges/:id',
      summary: 'Get a charge',
      parameters: {
        create: [
          { name: 'id', location: 'PATH', type: 'string', required: true, example: 'ch_abc' },
        ],
      },
      schemas: {
        create: [
          {
            kind: 'RESPONSE',
            name: 'Charge',
            statusCode: 200,
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                amount: { type: 'integer' },
                status: { type: 'string' },
              },
            },
          },
        ],
      },
    },
  });

  await db.apiEndpoint.create({
    data: {
      versionId: payV1.id,
      method: 'POST',
      path: '/refunds',
      summary: 'Refund a charge',
      schemas: {
        create: [
          {
            kind: 'REQUEST',
            name: 'CreateRefund',
            schema: {
              type: 'object',
              required: ['chargeId'],
              properties: {
                chargeId: { type: 'string' },
                amount: { type: 'integer' },
              },
            },
          },
        ],
      },
    },
  });

  const counts = {
    users: await db.user.count(),
    workspaces: await db.workspace.count(),
    apis: await db.api.count(),
    versions: await db.apiVersion.count(),
    endpoints: await db.apiEndpoint.count(),
    changes: await db.apiChange.count(),
  };

  console.log('[seed] Done.', counts);
}

main()
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
