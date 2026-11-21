import { z } from 'zod';
import { SLUG_RE } from '../utils/slug.js';
import { boolish, clearable, email, httpUrl } from './common.js';

const name = z.string().trim().min(2, 'At least 2 characters').max(80);

const fields = {
  name,
  ownerName: name,
  email: clearable(email),
  phone: clearable(z.string().trim().regex(/^\+?\d{8,15}$/, 'Invalid phone number')),
  // Custom menu URL part: /m/<slug>. Auto-generated from the name when empty.
  slug: clearable(
    z.string().trim().toLowerCase().regex(SLUG_RE, '3-50 chars: english letters, numbers and dashes'),
  ),
  instapayLink: clearable(httpUrl),
  vodafoneCashNumber: clearable(
    z.string().trim().regex(/^01[0125]\d{8}$/, 'Egyptian mobile number, e.g. 010xxxxxxxx'),
  ),
  vodafoneCashInstapayLink: clearable(httpUrl),
};

export const restaurantCreateSchema = z.object(fields);
export const restaurantUpdateSchema = z
  .object(fields)
  .partial()
  .extend({ removeLogo: boolish.optional() });
