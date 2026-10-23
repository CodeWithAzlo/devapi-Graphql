// ============================================================
// services/authService.js
// Register / login / refresh — the only place passwords are handled.
// ============================================================

import { GraphQLError } from 'graphql';
import { db } from '../db/index.js';
import { hashPassword, passwordsMatch } from '../auth/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../auth/tokens.js';

function toAuthPayload(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user,
  };
}

export async function register({ name, email, password }) {
  const trimmed = (email || '').trim().toLowerCase();
  if (!name || !trimmed || !password) {
    throw new GraphQLError('Name, email and password are required', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (password.length < 6) {
    throw new GraphQLError('Password must be at least 6 characters', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const exists = await db.user.findUnique({ where: { email: trimmed } });
  if (exists) {
    throw new GraphQLError('An account with this email already exists', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: trimmed,
      passwordHash: await hashPassword(password),
    },
  });

  return toAuthPayload(user);
}

export async function login({ email, password }) {
  const trimmed = (email || '').trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email: trimmed } });
  if (!user || !(await passwordsMatch(password || '', user.passwordHash))) {
    throw new GraphQLError('Email or password is wrong', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return toAuthPayload(user);
}

export async function refreshTokens(refreshToken) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error('no user');
    return toAuthPayload(user);
  } catch {
    throw new GraphQLError('Refresh token is invalid or expired. Log in again.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}
