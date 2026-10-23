// ============================================================
// services/apiService.js
// Catalog reads: APIs, endpoints, versions, diffs, changelog.
// ============================================================

import { GraphQLError } from 'graphql';
import { db } from '../db/index.js';
import { crudEndpointCreates, toResourcePath } from './crudTemplate.js';

export function getApi(id) {
  return db.api.findUnique({ where: { id } });
}

export function listApis({ workspaceId, search }) {
  const where = {
    ...(workspaceId ? { workspaceId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  return db.api.findMany({ where, orderBy: { name: 'asc' } });
}

export function getEndpoint(id) {
  return db.apiEndpoint.findUnique({ where: { id } });
}

export function filterEndpoints(endpoints, { method, search } = {}) {
  let list = endpoints;
  if (method) list = list.filter((e) => e.method === method);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (e) =>
        e.path.toLowerCase().includes(q) ||
        (e.summary || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
    );
  }
  return list;
}

export function listApiVersions(apiId) {
  return db.apiVersion.findMany({
    where: { apiId },
    orderBy: { version: 'asc' },
  });
}

export function listApiChanges({ fromVersionId, toVersionId, severity }) {
  return db.apiChange.findMany({
    where: {
      fromVersionId,
      toVersionId,
      ...(severity ? { severity } : {}),
    },
    orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function createApi({ workspaceId, name, description, baseUrl, resource }, user) {
  if (!name || !name.trim()) {
    throw new GraphQLError('API name is required', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const resourcePath = toResourcePath(resource, name);

  return db.$transaction(async (tx) => {
    const api = await tx.api.create({
      data: {
        workspaceId,
        name: name.trim(),
        description: description?.trim() || `REST docs for /${resourcePath}`,
        baseUrl: baseUrl?.trim() || null,
      },
    });

    const version = await tx.apiVersion.create({
      data: {
        apiId: api.id,
        version: 'v1',
        status: 'PUBLISHED',
        isCurrent: true,
        notes: `Starter CRUD for /${resourcePath}, created by ${user.name}`,
        publishedAt: new Date(),
      },
    });

    for (const endpoint of crudEndpointCreates(resourcePath)) {
      await tx.apiEndpoint.create({
        data: { versionId: version.id, ...endpoint },
      });
    }

    return api;
  });
}

export async function generateCrudEndpoints({ apiId, resource }) {
  const api = await db.api.findUnique({ where: { id: apiId } });
  if (!api) {
    throw new GraphQLError('API not found', { extensions: { code: 'NOT_FOUND' } });
  }

  const current = await db.apiVersion.findFirst({
    where: { apiId, isCurrent: true },
  });
  if (!current) {
    throw new GraphQLError('This API has no current version', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const resourcePath = toResourcePath(resource, api.name);
  const existing = await db.apiEndpoint.count({ where: { versionId: current.id } });
  if (existing > 0) {
    throw new GraphQLError('This version already has endpoints. Add extras one by one instead.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  for (const endpoint of crudEndpointCreates(resourcePath)) {
    await db.apiEndpoint.create({
      data: { versionId: current.id, ...endpoint },
    });
  }

  return db.api.findUnique({ where: { id: apiId } });
}

export async function createEndpoint({ apiId, method, path, summary, description }) {
  const current = await db.apiVersion.findFirst({
    where: { apiId, isCurrent: true },
  });
  if (!current) {
    throw new GraphQLError('This API has no current version', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const exists = await db.apiEndpoint.findFirst({
    where: { versionId: current.id, method, path: cleanPath },
  });
  if (exists) {
    throw new GraphQLError(`${method} ${cleanPath} already exists on this version`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return db.apiEndpoint.create({
    data: {
      versionId: current.id,
      method,
      path: cleanPath,
      summary: summary?.trim() || `${method} ${cleanPath}`,
      description: description?.trim() || null,
    },
  });
}

export function listChangelog(versionId) {
  return db.apiChangelog.findMany({
    where: { versionId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteApi(id) {
  const existing = await db.api.findUnique({ where: { id } });
  if (!existing) {
    throw new GraphQLError('API not found', { extensions: { code: 'NOT_FOUND' } });
  }
  await db.api.delete({ where: { id } });
  return true;
}
