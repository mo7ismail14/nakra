import { z } from 'zod';
import * as db from '../db/jsonStore.js';
import { newId } from '../utils/ids.js';
import { hashPassword, normalizeEmail, nowIso } from './auth.service.js';

/**
 * Creates the default superadmin from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD if there is no
 * superadmin yet. Runs on every start (local and Vercel) and from `npm run seed`. Safe to repeat.
 * @returns {{ status: 'exists'|'created'|'missing-config', email?: string, reason?: string }}
 */
export async function ensureSuperadmin() {
  const existing = await db.findOne('users', (u) => u.role === 'superadmin');
  if (existing) return { status: 'exists', email: existing.email };

  const email = normalizeEmail(process.env.SUPERADMIN_EMAIL);
  const password = process.env.SUPERADMIN_PASSWORD || '';
  if (!z.email().safeParse(email).success) return { status: 'missing-config', reason: 'SUPERADMIN_EMAIL is missing or invalid' };
  if (password.length < 8) return { status: 'missing-config', reason: 'SUPERADMIN_PASSWORD must be at least 8 characters' };

  const passwordHash = await hashPassword(password);
  await db.mutate('users', (users) => {
    if (users.some((u) => u.role === 'superadmin')) return; // created meanwhile by another instance
    if (users.some((u) => u.email === email)) throw new Error(`A user with ${email} already exists`);
    users.push({
      id: newId('u'),
      email,
      passwordHash,
      role: 'superadmin',
      restaurantId: null,
      tokenVersion: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  });
  return { status: 'created', email };
}

/** Prepare storage + default superadmin. Logs what happened; never stops the server. */
export async function bootstrap() {
  await db.ensureDataFiles();
  try {
    const result = await ensureSuperadmin();
    if (result.status === 'created') console.log(`[setup] Superadmin created: ${result.email}`);
    if (result.status === 'missing-config') console.warn(`[setup] No superadmin yet: ${result.reason}`);
  } catch (err) {
    console.error(`[setup] Could not create the superadmin: ${err.message}`);
  }
}
