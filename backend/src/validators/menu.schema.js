import { z } from 'zod';
import { boolish } from './common.js';

const price = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.coerce.number({ error: 'Price must be a number' }).min(0).max(1_000_000),
);

export const categorySchema = z.object({ name: z.string().trim().min(1, 'Name is required').max(60) });

export const itemCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  description: z.string().trim().max(300).optional(),
  price,
  isAvailable: boolish.optional(),
});

export const itemUpdateSchema = itemCreateSchema.partial().extend({ removeImage: boolish.optional() });

export const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(500) });
