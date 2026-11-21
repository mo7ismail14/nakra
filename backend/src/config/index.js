import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// APP_ENV is set by the npm scripts through cross-env:
//   npm run local -> local       (LOCAL_* URLs in .env)
//   npm run dev   -> dev         (DEV_*  URLs in .env, deployed dev server)
//   npm start     -> production  (PROD_* URLs in .env)
const APP_ENVS = ['local', 'dev', 'production'];
const appEnv = process.env.APP_ENV || 'local';
if (!APP_ENVS.includes(appEnv)) {
  throw new Error(`APP_ENV must be one of: ${APP_ENVS.join(', ')} (got "${appEnv}")`);
}

// One file: backend/.env. Real environment variables (set by the host) are never overridden.
dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });

// URL settings exist once per environment in .env: LOCAL_FRONTEND_URL, DEV_FRONTEND_URL, PROD_FRONTEND_URL...
// env('FRONTEND_URL') returns FRONTEND_URL if set directly (e.g. by the host), else the prefixed one.
const PREFIX = { local: 'LOCAL_', dev: 'DEV_', production: 'PROD_' }[appEnv];
const env = (name) => (process.env[name] ?? process.env[PREFIX + name])?.trim() || '';

function required(name) {
  const value = env(name);
  if (!value) throw new Error(`Missing ${PREFIX}${name} in backend/.env (APP_ENV=${appEnv})`);
  return value;
}

const stripSlash = (url) => url.replace(/\/+$/, '');
const list = (value) => (value || '').split(',').map((s) => s.trim()).filter(Boolean);

const port = Number(env('PORT')) || 4000;
const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters long');

const smtpPort = Number(process.env.SMTP_PORT) || 587;

export const config = Object.freeze({
  appEnv,
  isLocal: appEnv === 'local',
  isProduction: appEnv === 'production',
  port,
  trustProxy: Number(env('TRUST_PROXY')) || 0,

  backendUrl: stripSlash(env('BACKEND_URL') || `http://localhost:${port}`),
  frontendUrl: stripSlash(required('FRONTEND_URL')),
  publicMenuUrl: stripSlash(required('PUBLIC_MENU_URL')),
  corsOrigins: list(env('CORS_ORIGINS')).map(stripSlash),

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  tokenTtlMinutes: {
    reset: 60, // forgot-password link
    adminSetup: 72 * 60, // new admin "set your password" link
    invite: 72 * 60, // restaurant owner invitation
  },

  smtp: {
    host: process.env.SMTP_HOST?.trim() || '',
    port: smtpPort,
    secure: smtpPort === 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  mailFrom: process.env.MAIL_FROM || 'Nakra <no-reply@example.com>',

  paths: {
    root: backendRoot,
    data: path.resolve(process.env.DATA_DIR || path.join(backendRoot, 'src', 'data')),
    uploads: path.resolve(process.env.UPLOADS_DIR || path.join(backendRoot, 'uploads')),
  },
});
