import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as db from '../db/jsonStore.js';
import { badRequest, unauthorized } from '../utils/httpError.js';
import { newId } from '../utils/ids.js';
import { hashToken, randomToken } from '../utils/tokens.js';
import * as mail from './mail.service.js';

// Compared against when the email does not exist, so both cases take the same time.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

export const nowIso = () => new Date().toISOString();
export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
export const hashPassword = (password) => bcrypt.hash(password, 12);

/** User as sent to the frontend (no password hash). */
export function publicUser(user) {
  const { passwordHash, tokenVersion, ...rest } = user;
  return { ...rest, hasPassword: Boolean(passwordHash) };
}

export function signJwt(user) {
  return jwt.sign({ sub: user.id, role: user.role, tv: user.tokenVersion ?? 0 }, config.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.expiresIn,
  });
}

const session = (user) => ({ token: signJwt(user), user: publicUser(user) });

export async function login(email, password) {
  const user = await db.findOne('users', (u) => u.email === normalizeEmail(email));
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !user.passwordHash || !ok) throw unauthorized('Invalid email or password');
  return session(user);
}

// ---------- one-time tokens (password reset / admin setup / owner invitation) ----------

const isUsable = (t) => !t.usedAt && !t.revokedAt && new Date(t.expiresAt).getTime() > Date.now();
const invalidLink = () => badRequest('This link is invalid or has expired');

/**
 * Creates a token and returns the raw value (only its hash is stored).
 * Older unused tokens for the same user / restaurant invitation are revoked.
 */
export async function issueToken({ type, ttlMinutes, email, userId = null, restaurantId = null }) {
  const raw = randomToken();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  const weekAgo = Date.now() - 7 * 24 * 3600_000;

  await db.mutate('tokens', (tokens) => {
    const kept = tokens.filter((t) => new Date(t.expiresAt).getTime() > weekAgo); // housekeeping
    for (const t of kept) {
      const sameTarget =
        t.type === type && ((userId && t.userId === userId) || (restaurantId && t.restaurantId === restaurantId));
      if (sameTarget && !t.usedAt && !t.revokedAt) t.revokedAt = nowIso();
    }
    kept.push({
      id: newId('t'),
      type,
      tokenHash: hashToken(raw),
      email,
      userId,
      restaurantId,
      createdAt: nowIso(),
      expiresAt,
      usedAt: null,
      revokedAt: null,
    });
    tokens.length = 0;
    tokens.push(...kept);
  });
  return { raw, expiresAt };
}

/** Returns the token record if usable, without consuming it. */
export async function peekToken(raw, type) {
  const hash = hashToken(raw);
  const token = await db.findOne('tokens', (t) => t.tokenHash === hash && t.type === type);
  if (!token || !isUsable(token)) throw invalidLink();
  return token;
}

/** Marks the token as used (atomically, so a link can't be used twice) and returns it. */
export function consumeToken(raw, type) {
  const hash = hashToken(raw);
  return db.mutate('tokens', (tokens) => {
    const token = tokens.find((t) => t.tokenHash === hash && t.type === type);
    if (!token || !isUsable(token)) throw invalidLink();
    token.usedAt = nowIso();
    return token;
  });
}

export const revokeTokensWhere = (predicate) =>
  db.mutate('tokens', (tokens) => {
    for (const t of tokens) if (predicate(t) && !t.usedAt && !t.revokedAt) t.revokedAt = nowIso();
  });

// ---------- password reset ----------

export const resetLink = (raw) => `${config.frontendUrl}/reset-password/${raw}`;

/** Always succeeds from the caller's point of view, so nobody can probe which emails exist. */
export async function requestPasswordReset(email) {
  const user = await db.findOne('users', (u) => u.email === normalizeEmail(email));
  if (!user) return;
  const { raw } = await issueToken({
    type: 'reset',
    ttlMinutes: config.tokenTtlMinutes.reset,
    userId: user.id,
    email: user.email,
  });
  await mail.sendPasswordReset(user.email, resetLink(raw));
}

export async function getResetInfo(raw) {
  const token = await peekToken(raw, 'reset');
  return { email: token.email, expiresAt: token.expiresAt };
}

/** Sets the new password, logs out other sessions, and logs this one in. */
export async function resetPassword(raw, password) {
  const passwordHash = await hashPassword(password);
  const token = await consumeToken(raw, 'reset');
  const user = await db.mutate('users', (users) => {
    const u = users.find((x) => x.id === token.userId);
    if (!u) throw invalidLink();
    u.passwordHash = passwordHash;
    u.tokenVersion = (u.tokenVersion ?? 0) + 1;
    u.updatedAt = nowIso();
    return u;
  });
  return session(user);
}

export { session };
