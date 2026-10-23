// ============================================================
// graphql/resolvers/catalog.js
// Query resolvers + nested field resolvers.
// Nested fields use DataLoader (context.loaders) to avoid N+1.
// ============================================================

import { GraphQLError } from 'graphql';
import { listWorkspaces, getWorkspace, createWorkspace, deleteWorkspace } from '../../services/workspaceService.js';
import {
  getApi,
  listApis,
  getEndpoint,
  filterEndpoints,
  listApiVersions,
  listApiChanges,
  listChangelog,
  createApi,
  generateCrudEndpoints,
  createEndpoint,
  deleteApi,
} from '../../services/apiService.js';
import { requireUser, requireWorkspaceRole } from '../../auth/requireUser.js';

export const catalogResolvers = {
  Query: {
    workspaces: (_parent, args, ctx) => {
      requireUser(ctx);
      return listWorkspaces(args);
    },
    workspace: (_parent, args, ctx) => {
      requireUser(ctx);
      return getWorkspace(args);
    },
    apis: (_parent, args, ctx) => {
      requireUser(ctx);
      return listApis(args);
    },
    api: (_parent, { id }, ctx) => {
      requireUser(ctx);
      return getApi(id);
    },
    endpoint: (_parent, { id }, ctx) => {
      requireUser(ctx);
      return getEndpoint(id);
    },
    apiVersions: (_parent, { apiId }, ctx) => {
      requireUser(ctx);
      return listApiVersions(apiId);
    },
    apiChanges: (_parent, args, ctx) => {
      requireUser(ctx);
      return listApiChanges(args);
    },
    changelog: (_parent, { versionId }, ctx) => {
      requireUser(ctx);
      return listChangelog(versionId);
    },
  },

  Mutation: {
    createWorkspace: (_parent, args, ctx) => {
      const user = requireUser(ctx);
      return createWorkspace(args, user);
    },
    createApi: async (_parent, args, ctx) => {
      await requireWorkspaceRole(ctx, args.workspaceId, ['OWNER', 'ADMIN']);
      return createApi(args, ctx.user);
    },
    generateCrudEndpoints: async (_parent, args, ctx) => {
      const api = await getApi(args.apiId);
      if (!api) {
        throw new GraphQLError('API not found', { extensions: { code: 'NOT_FOUND' } });
      }
      await requireWorkspaceRole(ctx, api.workspaceId, ['OWNER', 'ADMIN']);
      return generateCrudEndpoints(args);
    },
    createEndpoint: async (_parent, args, ctx) => {
      const api = await getApi(args.apiId);
      if (!api) {
        throw new GraphQLError('API not found', { extensions: { code: 'NOT_FOUND' } });
      }
      await requireWorkspaceRole(ctx, api.workspaceId, ['OWNER', 'ADMIN']);
      return createEndpoint(args);
    },
    deleteWorkspace: async (_parent, { id }, ctx) => {
      await requireWorkspaceRole(ctx, id, ['OWNER']);
      return deleteWorkspace(id);
    },
    deleteApi: async (_parent, { id }, ctx) => {
      const api = await getApi(id);
      if (!api) {
        throw new GraphQLError('API not found', { extensions: { code: 'NOT_FOUND' } });
      }
      await requireWorkspaceRole(ctx, api.workspaceId, ['OWNER', 'ADMIN']);
      return deleteApi(id);
    },
  },

  Workspace: {
    owner: (workspace, _args, ctx) => ctx.loaders.user.load(workspace.ownerId),
    members: (workspace, _args, ctx) => ctx.loaders.membersByWorkspace.load(workspace.id),
    apis: (workspace, _args, ctx) => ctx.loaders.apisByWorkspace.load(workspace.id),
  },

  WorkspaceMember: {
    user: (member, _args, ctx) => ctx.loaders.user.load(member.userId),
  },

  Api: {
    workspace: (api, _args, ctx) => ctx.loaders.workspace.load(api.workspaceId),
    versions: (api, _args, ctx) => ctx.loaders.versionsByApi.load(api.id),
    currentVersion: (api, _args, ctx) => ctx.loaders.currentVersionByApi.load(api.id),
    endpoints: async (api, args, ctx) => {
      const current = await ctx.loaders.currentVersionByApi.load(api.id);
      if (!current) return [];
      const endpoints = await ctx.loaders.endpointsByVersion.load(current.id);
      return filterEndpoints(endpoints, args);
    },
  },

  ApiVersion: {
    endpoints: async (version, args, ctx) => {
      const endpoints = await ctx.loaders.endpointsByVersion.load(version.id);
      return filterEndpoints(endpoints, args);
    },
    changelog: (version, _args, ctx) => ctx.loaders.changelogByVersion.load(version.id),
  },

  ApiEndpoint: {
    parameters: (endpoint, _args, ctx) => ctx.loaders.parametersByEndpoint.load(endpoint.id),
    schemas: (endpoint, _args, ctx) => ctx.loaders.schemasByEndpoint.load(endpoint.id),
    examples: (endpoint, _args, ctx) => ctx.loaders.examplesByEndpoint.load(endpoint.id),
  },

  ApiSchema: {
    json: (schema) => schema.schema,
  },
};
