import { shortId } from './ids.js';

// 3-50 chars, lowercase letters, digits and dashes, no dash at the start/end.
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
}

/** Slug from the name; Arabic-only names (no latin letters) get "menu-xxxxx". */
export function uniqueSlug(name, takenSlugs) {
  const base = slugify(name);
  const prefix = base.length >= 3 ? base : 'menu';
  let candidate = base.length >= 3 ? base : `menu-${shortId()}`;
  while (takenSlugs.has(candidate)) candidate = `${prefix}-${shortId()}`;
  return candidate;
}
