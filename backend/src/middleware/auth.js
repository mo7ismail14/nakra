import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as db from '../db/jsonStore.js';
import { unauthorized } from '../utils/httpError.js';

// Reads "Authorization: Bearer <jwt>", loads the user fresh from users.json on every request,
// so a deleted user or a changed password (tokenVersion) logs the user out immediately.
export async function requireAuth(req, _res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw unauthorized('Login required');

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
  } catch {
    throw unauthorized('Session expired, please login again');
  }

  const user = await db.findOne('users', (u) => u.id === payload.sub);
  if (!user || (user.tokenVersion ?? 0) !== payload.tv) {
    throw unauthorized('Session expired, please login again');
  }
  req.user = user;
  next();
}
