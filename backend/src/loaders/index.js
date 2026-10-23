// ============================================================
// loaders/index.js
//
// DataLoader batches DB reads that happen in nested GraphQL fields.
//
// Without it (N+1):
//   workspaces { apis { endpoints { parameters } } }
//   → 1 query for workspaces
//   → 1 query PER workspace for apis
//   → 1 query PER api for endpoints
//
// With it:
//   all apis for those workspace ids load in ONE findMany.
// A new loader map is created per HTTP request (see app.js context).
// ============================================================

import DataLoader from 'dataloader';
import { db } from '../db/index.js';

function groupBy(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const id = row[key];
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(row);
  }
  return map;
}

export function createLoaders() {
  return {
    user: new DataLoader(async (ids) => {
      const rows = await db.user.findMany({ where: { id: { in: [...ids] } } });
      const byId = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => byId.get(id) || null);
    }),

    workspace: new DataLoader(async (ids) => {
      const rows = await db.workspace.findMany({ where: { id: { in: [...ids] } } });
      const byId = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => byId.get(id) || null);
    }),

    apisByWorkspace: new DataLoader(async (workspaceIds) => {
      const rows = await db.api.findMany({
        where: { workspaceId: { in: [...workspaceIds] } },
        orderBy: { name: 'asc' },
      });
      const grouped = groupBy(rows, 'workspaceId');
      return workspaceIds.map((id) => grouped.get(id) || []);
    }),

    membersByWorkspace: new DataLoader(async (workspaceIds) => {
      const rows = await db.workspaceMember.findMany({
        where: { workspaceId: { in: [...workspaceIds] } },
      });
      const grouped = groupBy(rows, 'workspaceId');
      return workspaceIds.map((id) => grouped.get(id) || []);
    }),

    versionsByApi: new DataLoader(async (apiIds) => {
      const rows = await db.apiVersion.findMany({
        where: { apiId: { in: [...apiIds] } },
        orderBy: { version: 'asc' },
      });
      const grouped = groupBy(rows, 'apiId');
      return apiIds.map((id) => grouped.get(id) || []);
    }),

    currentVersionByApi: new DataLoader(async (apiIds) => {
      const rows = await db.apiVersion.findMany({
        where: { apiId: { in: [...apiIds] }, isCurrent: true },
      });
      const byApi = new Map(rows.map((r) => [r.apiId, r]));
      return apiIds.map((id) => byApi.get(id) || null);
    }),

    endpointsByVersion: new DataLoader(async (versionIds) => {
      const rows = await db.apiEndpoint.findMany({
        where: { versionId: { in: [...versionIds] } },
        orderBy: [{ path: 'asc' }, { method: 'asc' }],
      });
      const grouped = groupBy(rows, 'versionId');
      return versionIds.map((id) => grouped.get(id) || []);
    }),

    parametersByEndpoint: new DataLoader(async (endpointIds) => {
      const rows = await db.apiParameter.findMany({
        where: { endpointId: { in: [...endpointIds] } },
      });
      const grouped = groupBy(rows, 'endpointId');
      return endpointIds.map((id) => grouped.get(id) || []);
    }),

    schemasByEndpoint: new DataLoader(async (endpointIds) => {
      const rows = await db.apiSchema.findMany({
        where: { endpointId: { in: [...endpointIds] } },
      });
      const grouped = groupBy(rows, 'endpointId');
      return endpointIds.map((id) => grouped.get(id) || []);
    }),

    examplesByEndpoint: new DataLoader(async (endpointIds) => {
      const rows = await db.apiExample.findMany({
        where: { endpointId: { in: [...endpointIds] } },
      });
      const grouped = groupBy(rows, 'endpointId');
      return endpointIds.map((id) => grouped.get(id) || []);
    }),

    changelogByVersion: new DataLoader(async (versionIds) => {
      const rows = await db.apiChangelog.findMany({
        where: { versionId: { in: [...versionIds] } },
        orderBy: { createdAt: 'desc' },
      });
      const grouped = groupBy(rows, 'versionId');
      return versionIds.map((id) => grouped.get(id) || []);
    }),
  };
}
