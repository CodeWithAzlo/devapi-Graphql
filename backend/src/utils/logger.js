// ============================================================
// utils/logger.js
// Tiny helper so logs have a consistent prefix.
// Later we could swap this for winston/pino without touching
// the rest of the app.
// ============================================================

export const logger = {
  info: (...args) => console.log('[DevAPI]', ...args),
  warn: (...args) => console.warn('[DevAPI]', ...args),
  error: (...args) => console.error('[DevAPI]', ...args),
};
