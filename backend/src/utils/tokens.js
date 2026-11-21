import crypto from 'node:crypto';

/** Random URL-safe token sent to the user (never stored as is). */
export const randomToken = () => crypto.randomBytes(32).toString('base64url');

/** What we store instead of the raw token. */
export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
