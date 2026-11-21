import { Router } from 'express';
import { config } from '../config/index.js';
import adminsRoutes from './admins.routes.js';
import authRoutes from './auth.routes.js';
import invitationsRoutes from './invitations.routes.js';
import publicRoutes from './public.routes.js';
import restaurantsRoutes from './restaurants.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, env: config.appEnv, time: new Date().toISOString() }));
router.use('/auth', authRoutes);
router.use('/admins', adminsRoutes);
router.use('/restaurants', restaurantsRoutes);
router.use('/invitations', invitationsRoutes);
router.use('/public', publicRoutes);

export default router;
