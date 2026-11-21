import { Router } from 'express';
import * as c from '../controllers/public.controller.js';

// No login: what customers open from the menu QR code.
const router = Router();
router.get('/menu/:slug', c.menu);

export default router;
