// ============================================================
// graphql/resolvers/health.js
// ============================================================

import { getHealthStatus, getProjectInfo } from '../../services/healthService.js';

export const healthResolvers = {
  Query: {
    health: () => getHealthStatus(),
    projectInfo: () => getProjectInfo(),
  },
};
