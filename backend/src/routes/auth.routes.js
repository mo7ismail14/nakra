import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '../validators/auth.schema.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), c.login);
router.get('/me', requireAuth, c.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), c.forgotPassword);
router.get('/reset-password/:token', authLimiter, c.resetInfo);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), c.resetPassword);

export default router;
