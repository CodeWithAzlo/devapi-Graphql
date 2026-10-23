// ============================================================
// auth/requireUser.js
// Call this at the top of any resolver that needs a logged-in user.
// ============================================================

import { GraphQLError } from 'graphql';
import { verifyAccessToken } from './tokens.js';
import { db } from '../db/index.js';

export function requireUser(ctx) {
  if (!ctx.user) {
    throw new GraphQLError('Please log in first', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return ctx.user;
}

export async function requireWorkspaceRole(ctx, workspaceId, roles = ['OWNER', 'ADMIN']) {
  const user = requireUser(ctx);
  const member = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: user.id },
    },
  });
  if (!member || !roles.includes(member.role)) {
    throw new GraphQLError('You cannot change this workspace', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return { user, member };
}

export async function getUserFromAuthHeader(authorization) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  const token = authorization.slice(7);
  try {
    const payload = verifyAccessToken(token);
    if (payload.typ !== 'access') return null;
    return db.user.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}
