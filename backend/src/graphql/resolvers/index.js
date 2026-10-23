// ============================================================
// graphql/resolvers/index.js
// ============================================================

import { dateTimeScalar, jsonScalar } from '../scalars.js';
import { healthResolvers } from './health.js';
import { catalogResolvers } from './catalog.js';
import { authResolvers } from './auth.js';

export const resolvers = {
  DateTime: dateTimeScalar,
  JSON: jsonScalar,
  Query: {
    ...healthResolvers.Query,
    ...authResolvers.Query,
    ...catalogResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...catalogResolvers.Mutation,
  },
  Workspace: catalogResolvers.Workspace,
  WorkspaceMember: catalogResolvers.WorkspaceMember,
  Api: catalogResolvers.Api,
  ApiVersion: catalogResolvers.ApiVersion,
  ApiEndpoint: catalogResolvers.ApiEndpoint,
  ApiSchema: catalogResolvers.ApiSchema,
};
