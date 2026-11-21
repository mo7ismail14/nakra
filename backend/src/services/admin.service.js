import { config } from '../config/index.js';
import * as db from '../db/jsonStore.js';
import { badRequest, conflict, notFound } from '../utils/httpError.js';
import { newId } from '../utils/ids.js';
import { issueToken, normalizeEmail, nowIso, publicUser, resetLink, revokeTokensWhere } from './auth.service.js';
import * as mail from './mail.service.js';

const isStaff = (u) => u.role === 'admin' || u.role === 'superadmin';

export async function listAdmins() {
  const users = await db.findAll('users', isStaff);
  return users.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(publicUser);
}

async function sendSetupLink(user) {
  const { raw, expiresAt } = await issueToken({
    type: 'reset',
    ttlMinutes: config.tokenTtlMinutes.adminSetup,
    userId: user.id,
    email: user.email,
  });
  const link = resetLink(raw);
  const emailSent = await mail.sendAdminWelcome(user.email, link);
  // The link is returned to the superadmin too, so it can be shared another way if email fails.
  return { setupLink: link, emailSent, expiresAt };
}

export async function createAdmin(email, createdBy) {
  const normalized = normalizeEmail(email);
  const user = await db.mutate('users', (users) => {
    if (users.some((u) => u.email === normalized)) throw conflict('A user with this email already exists');
    const u = {
      id: newId('u'),
      email: normalized,
      passwordHash: null,
      role: 'admin',
      restaurantId: null,
      tokenVersion: 0,
      createdBy,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    users.push(u);
    return u;
  });
  return { user: publicUser(user), ...(await sendSetupLink(user)) };
}

export async function resendSetupLink(id) {
  const user = await db.findOne('users', (u) => u.id === id && u.role === 'admin');
  if (!user) throw notFound('Admin not found');
  return sendSetupLink(user);
}

export async function deleteAdmin(id, currentUserId) {
  if (id === currentUserId) throw badRequest('You cannot delete your own account');
  const [removed] = await db.removeWhere('users', (u) => u.id === id && u.role === 'admin');
  if (!removed) throw notFound('Admin not found');
  await revokeTokensWhere((t) => t.userId === id);
}
