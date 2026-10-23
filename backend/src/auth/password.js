// ============================================================
// auth/password.js
// We never store the real password. bcrypt turns "Dev@123"
// into a hash. Later we compare the login attempt to that hash.
// ============================================================

import bcrypt from 'bcryptjs';

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function passwordsMatch(plain, passwordHash) {
  return bcrypt.compare(plain, passwordHash);
}
