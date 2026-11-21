import { Router } from 'express';
import * as c from '../controllers/admins.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createAdminSchema } from '../validators/auth.schema.js';

// Superadmin only.
const router = Router();
router.use(requireAuth, requireRole('superadmin'));

router.get('/', c.list);
router.post('/', validate(createAdminSchema), c.create);
router.post('/:id/resend-setup', c.resendSetup);
router.delete('/:id', c.remove);

export default router;
