import { Router } from 'express';
import * as c from '../controllers/invitations.controller.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { acceptInvitationSchema } from '../validators/auth.schema.js';

// Public: used by the restaurant owner from the invitation email link.
const router = Router();

router.get('/:token', authLimiter, c.info);
router.post('/:token/accept', authLimiter, validate(acceptInvitationSchema), c.accept);

export default router;
