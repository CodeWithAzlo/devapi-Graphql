// ============================================================
// graphql/resolvers/auth.js
// ============================================================

import { register, login, refreshTokens } from '../../services/authService.js';

export const authResolvers = {
  Query: {
    currentUser: (_parent, _args, ctx) => ctx.user || null,
  },
  Mutation: {
    register: (_parent, args) => register(args),
    login: (_parent, args) => login(args),
    refreshToken: (_parent, { refreshToken }) => refreshTokens(refreshToken),
  },
};
