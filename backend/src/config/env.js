// ============================================================
// config/env.js
// Loads .env and exports the values the rest of the app needs.
// Every other file should import from here — not from process.env
// directly — so we have one place to document each variable.
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM does not give us __dirname, so we recreate it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env (this file lives in src/config, so go up two levels)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
};
