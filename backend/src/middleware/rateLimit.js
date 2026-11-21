import { rateLimit } from 'express-rate-limit';

// Brute-force protection for login / reset / invitation endpoints.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in a few minutes' },
});
