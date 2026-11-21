import { Readable } from 'node:stream';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { HttpError } from './utils/httpError.js';
import routes from './routes/index.js';
import { storage } from './storage/index.js';
import { uploadKey } from './utils/files.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy); // behind the host's proxy (dev/production)

  // cross-origin-resource-policy: images in /uploads are shown by the frontend on another origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS: only the origins listed in CORS_ORIGINS (per APP_ENV) may call the API from a browser.
  // Local only: any localhost port is allowed too (Vite moves to 5174, 5175... when 5173 is busy).
  const isLocalhost = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        if (config.isLocal && isLocalhost(origin)) return callback(null, true);
        callback(new HttpError(403, `Origin ${origin} is not allowed (add it to CORS_ORIGINS)`));
      },
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use('/uploads', storage.readUpload ? serveFromStorage : express.static(config.paths.uploads, { maxAge: '7d', index: false, dotfiles: 'ignore' }));

  app.get('/', (_req, res) => res.json({ name: 'Nakra API', env: config.appEnv, health: '/api/health' }));
  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

// Images in a private Blob store are streamed through the API (same /uploads/... URLs as locally).
// File names are random and never reused, so they can be cached for a long time.
async function serveFromStorage(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const key = uploadKey(`/uploads${req.path}`);
  if (!key) return next();
  const file = await storage.readUpload(key);
  if (!file) return next();
  res.set({ 'Content-Type': file.contentType, 'Cache-Control': 'public, max-age=31536000, immutable', ETag: file.etag });
  if (req.method === 'HEAD') return res.end();
  Readable.fromWeb(file.stream).pipe(res);
}
