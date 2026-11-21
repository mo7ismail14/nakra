import * as db from '../db/jsonStore.js';
import { absoluteUrl, removeUpload, withUpload } from '../utils/files.js';
import { badRequest, conflict, notFound } from '../utils/httpError.js';
import { newId } from '../utils/ids.js';
import { uniqueSlug } from '../utils/slug.js';
import { nowIso, revokeTokensWhere } from './auth.service.js';
import { menuUrl, restaurantQrCodes } from './qr.service.js';

const PAYMENT_KEYS = ['instapayLink', 'vodafoneCashNumber', 'vodafoneCashInstapayLink'];
const INFO_KEYS = ['name', 'ownerName', 'email', 'phone'];

export const serializeItem = (item) => ({ ...item, imageUrl: absoluteUrl(item.image) });
export const serializeCategory = (c) => ({ ...c, items: c.items.map(serializeItem) });

function summary(r, owner) {
  const itemsCount = r.categories.reduce((n, c) => n + c.items.length, 0);
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    ownerName: r.ownerName,
    email: r.email,
    phone: r.phone,
    logoUrl: absoluteUrl(r.logo),
    menuUrl: menuUrl(r),
    categoriesCount: r.categories.length,
    itemsCount,
    hasOwnerAccount: Boolean(owner),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function list(user) {
  const visible = user.role === 'owner' ? (r) => r.id === user.restaurantId : () => true;
  const [restaurants, owners] = await Promise.all([
    db.findAll('restaurants', visible),
    db.findAll('users', (u) => u.role === 'owner'),
  ]);
  return restaurants
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => summary(r, owners.find((o) => o.restaurantId === r.id)));
}

async function findOrThrow(id) {
  const r = await db.findOne('restaurants', (x) => x.id === id);
  if (!r) throw notFound('Restaurant not found');
  return r;
}

/** Full restaurant: info, payments, menu, owner account and pending invitation. */
export async function getById(id) {
  const r = await findOrThrow(id);
  const now = Date.now();
  const [owner, invitation] = await Promise.all([
    db.findOne('users', (u) => u.role === 'owner' && u.restaurantId === id),
    db.findOne(
      'tokens',
      (t) =>
        t.type === 'invite' && t.restaurantId === id && !t.usedAt && !t.revokedAt && new Date(t.expiresAt) > now,
    ),
  ]);
  return {
    ...summary(r, owner),
    logo: r.logo,
    payments: r.payments,
    categories: r.categories.map(serializeCategory),
    ownerAccount: owner ? { id: owner.id, email: owner.email, createdAt: owner.createdAt } : null,
    pendingInvitation: invitation
      ? { email: invitation.email, createdAt: invitation.createdAt, expiresAt: invitation.expiresAt }
      : null,
  };
}

function assertContact(r) {
  if (!r.email && !r.phone) throw badRequest('Email or phone is required', [{ field: 'email', message: 'Email or phone is required' }]);
}

export async function create(input, file, createdBy) {
  const created = await withUpload('logos', file, (logo) => db.mutate('restaurants', (restaurants) => {
    const taken = new Set(restaurants.map((r) => r.slug));
    if (input.slug && taken.has(input.slug)) throw conflict('This menu link is already taken');
    const r = {
      id: newId('r'),
      slug: input.slug || uniqueSlug(input.name, taken),
      name: input.name,
      ownerName: input.ownerName,
      email: input.email || '',
      phone: input.phone || '',
      logo,
      payments: Object.fromEntries(PAYMENT_KEYS.map((k) => [k, input[k] || ''])),
      categories: [],
      createdBy,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    assertContact(r);
    restaurants.push(r);
    return r;
  }));
  return getById(created.id);
}

export async function update(id, input, file) {
  let oldLogo = null;
  await withUpload('logos', file, (newLogo) => db.mutate('restaurants', (restaurants) => {
    const r = restaurants.find((x) => x.id === id);
    if (!r) throw notFound('Restaurant not found');

    if (input.slug && input.slug !== r.slug) {
      if (restaurants.some((x) => x.slug === input.slug)) throw conflict('This menu link is already taken');
      r.slug = input.slug;
    }
    for (const k of INFO_KEYS) if (input[k] !== undefined) r[k] = input[k];
    for (const k of PAYMENT_KEYS) if (input[k] !== undefined) r.payments[k] = input[k];
    assertContact(r);

    oldLogo = null;
    if (newLogo || input.removeLogo) {
      oldLogo = r.logo;
      r.logo = newLogo;
    }
    r.updatedAt = nowIso();
  }));
  if (oldLogo) await removeUpload(oldLogo);
  return getById(id);
}

/** Deletes the restaurant, its owner account, its pending links and all its images. */
export async function remove(id) {
  const [r] = await db.removeWhere('restaurants', (x) => x.id === id);
  if (!r) throw notFound('Restaurant not found');
  await db.removeWhere('users', (u) => u.role === 'owner' && u.restaurantId === id);
  await revokeTokensWhere((t) => t.restaurantId === id);
  const images = [r.logo, ...r.categories.flatMap((c) => c.items.map((i) => i.image))];
  await Promise.all(images.map(removeUpload));
}

export async function qrCodes(id) {
  return restaurantQrCodes(await findOrThrow(id));
}

/** What a customer sees at /m/:slug (no owner name/email/phone). */
export async function publicMenu(slug) {
  const r = await db.findOne('restaurants', (x) => x.slug === slug);
  if (!r) throw notFound('Menu not found');
  return {
    name: r.name,
    slug: r.slug,
    logoUrl: absoluteUrl(r.logo),
    payments: r.payments,
    categories: r.categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        items: c.items.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: i.price,
          imageUrl: absoluteUrl(i.image),
          isAvailable: i.isAvailable,
        })),
      }))
      .filter((c) => c.items.length > 0),
  };
}
