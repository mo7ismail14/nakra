import { z } from 'zod';

export const email = z.string().trim().toLowerCase().email('Invalid email').max(120);
export const password = z.string().min(8, 'Password must be at least 8 characters').max(128);

/** Accepts true/false and "true"/"false" (multipart form fields are strings). */
export const boolish = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean());

/** Only http(s) links (blocks javascript: links on the public menu page). */
export const httpUrl = z
  .string()
  .trim()
  .max(500)
  .url('Invalid link')
  .refine((u) => /^https?:\/\//i.test(u), 'Link must start with http:// or https://');

/** Optional field where "" means "clear it". */
export const clearable = (schema) => z.union([z.literal(''), schema]).optional();
