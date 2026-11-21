import { Router } from 'express';
import * as c from '../controllers/restaurants.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRestaurantAccess, requireRole, STAFF } from '../middleware/roles.js';
import { uploadLogo } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { sendInvitationSchema } from '../validators/auth.schema.js';
import { restaurantCreateSchema, restaurantUpdateSchema } from '../validators/restaurant.schema.js';
import menuRoutes from './menu.routes.js';

const router = Router();
router.use(requireAuth);

const staffOnly = requireRole(...STAFF);
const canAccess = requireRestaurantAccess('id');

// Staff see all restaurants; an owner sees only his own.
router.get('/', c.list);
router.post('/', staffOnly, uploadLogo, validate(restaurantCreateSchema), c.create);
router.get('/:id', canAccess, c.get);
router.patch('/:id', canAccess, uploadLogo, validate(restaurantUpdateSchema), c.update);
router.delete('/:id', staffOnly, c.remove);
router.get('/:id/qr-codes', canAccess, c.qrCodes);

// Owner invitation (staff only)
router.post('/:id/invitation', staffOnly, validate(sendInvitationSchema), c.sendInvitation);
router.delete('/:id/invitation', staffOnly, c.revokeInvitation);
router.delete('/:id/owner', staffOnly, c.removeOwner);

// Menu: categories and items (staff + the restaurant's owner)
router.use('/:id', canAccess, menuRoutes);

export default router;
