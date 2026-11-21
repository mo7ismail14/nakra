import { z } from 'zod';
import { email, password } from './common.js';

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required').max(128) });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ token: z.string().min(20).max(200), password });
export const acceptInvitationSchema = z.object({ password });
export const createAdminSchema = z.object({ email });
export const sendInvitationSchema = z.object({ email: email.optional() });
