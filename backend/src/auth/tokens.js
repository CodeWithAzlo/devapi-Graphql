// ============================================================
// auth/tokens.js
//
// Two tokens (common real-world pattern):
//   accessToken  — short life, sent on every GraphQL request
//                  as:  Authorization: Bearer <token>
//   refreshToken — longer life, used only to get a new access token
//
// Both are JWTs signed with secrets from .env
// ============================================================

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, typ: 'access' },
    env.jwtAccessSecret,
    { expiresIn: '8h' }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, typ: 'refresh' },
    env.jwtRefreshSecret,
    { expiresIn: '30d' }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.jwtRefreshSecret);
  if (payload.typ !== 'refresh') {
    throw new Error('Not a refresh token');
  }
  return payload;
}
