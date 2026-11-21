import { config } from '../config/index.js';
import * as db from '../db/jsonStore.js';
import { badRequest, conflict, notFound } from '../utils/httpError.js';
import { newId } from '../utils/ids.js';
import {
  consumeToken,
  hashPassword,
  issueToken,
  normalizeEmail,
  nowIso,
  peekToken,
  revokeTokensWhere,
  session,
} from './auth.service.js';
import * as mail from './mail.service.js';

const findOwner = (restaurantId) => db.findOne('users', (u) => u.role === 'owner' && u.restaurantId === restaurantId);

/** Sends (or re-sends) the owner invitation. The link is also returned so staff can share it on WhatsApp etc. */
export async function sendInvitation(restaurantId, emailOverride) {
  const r = await db.findOne('restaurants', (x) => x.id === restaurantId);
  if (!r) throw notFound('Restaurant not found');

  const email = normalizeEmail(emailOverride || r.email);
  if (!email) throw badRequest('The restaurant has no email. Add one or send the invitation to a specific email.');
  if (await findOwner(restaurantId)) throw conflict('This restaurant already has an owner account');
  if (await db.findOne('users', (u) => u.email === email)) throw conflict('This email already belongs to another account');

  const { raw, expiresAt } = await issueToken({
    type: 'invite',
    ttlMinutes: config.tokenTtlMinutes.invite,
    restaurantId,
    email,
  });
  const link = `${config.frontendUrl}/invite/${raw}`;
  const emailSent = await mail.sendOwnerInvitation(email, r.name, link);
  return { email, link, emailSent, expiresAt };
}

export async function revokeInvitation(restaurantId) {
  await revokeTokensWhere((t) => t.type === 'invite' && t.restaurantId === restaurantId);
}

/** Removes the owner's account (he loses access). A new invitation can be sent afterwards. */
export async function removeOwner(restaurantId) {
  const removed = await db.removeWhere('users', (u) => u.role === 'owner' && u.restaurantId === restaurantId);
  if (!removed.length) throw notFound('This restaurant has no owner account');
  await revokeTokensWhere((t) => removed.some((u) => u.id === t.userId));
}

/** Shown on the "accept invitation" page before the owner sets a password. */
export async function getInvitation(raw) {
  const token = await peekToken(raw, 'invite');
  const r = await db.findOne('restaurants', (x) => x.id === token.restaurantId);
  if (!r) throw badRequest('This link is invalid or has expired');
  return { email: token.email, restaurantName: r.name, expiresAt: token.expiresAt };
}

/** Creates the owner account linked to the restaurant and logs him in. */
export async function acceptInvitation(raw, password) {
  await getInvitation(raw); // fail fast with a clear error before hashing
  const passwordHash = await hashPassword(password);
  const token = await consumeToken(raw, 'invite');

  const user = await db.mutate('users', (users) => {
    if (users.some((u) => u.email === token.email)) throw conflict('This email already belongs to another account');
    if (users.some((u) => u.role === 'owner' && u.restaurantId === token.restaurantId)) {
      throw conflict('This restaurant already has an owner account');
    }
    const u = {
      id: newId('u'),
      email: token.email,
      passwordHash,
      role: 'owner',
      restaurantId: token.restaurantId,
      tokenVersion: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    users.push(u);
    return u;
  });
  return session(user);
}
