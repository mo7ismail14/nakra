// Categories and items live inside restaurant.categories[].items[].
// Array order = display order; reorder endpoints rearrange the arrays.
import * as db from '../db/jsonStore.js';
import { removeUpload, withUpload } from '../utils/files.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { newId } from '../utils/ids.js';
import { nowIso } from './auth.service.js';
import { serializeCategory, serializeItem } from './restaurant.service.js';

const MAX_CATEGORIES = 100;
const MAX_ITEMS_PER_CATEGORY = 300;
const roundPrice = (p) => Math.round(p * 100) / 100;

function inRestaurant(restaurantId, fn) {
  return db.mutate('restaurants', (restaurants) => {
    const r = restaurants.find((x) => x.id === restaurantId);
    if (!r) throw notFound('Restaurant not found');
    const result = fn(r);
    r.updatedAt = nowIso();
    return result;
  });
}

function findCategory(r, categoryId) {
  const c = r.categories.find((x) => x.id === categoryId);
  if (!c) throw notFound('Category not found');
  return c;
}

function findItem(c, itemId) {
  const item = c.items.find((x) => x.id === itemId);
  if (!item) throw notFound('Item not found');
  return item;
}

/** Returns arr rearranged to match ids; ids must list every element exactly once. */
function reorder(arr, ids) {
  const byId = new Map(arr.map((x) => [x.id, x]));
  if (ids.length !== arr.length || new Set(ids).size !== ids.length || !ids.every((id) => byId.has(id))) {
    throw badRequest('ids must contain every id exactly once');
  }
  return ids.map((id) => byId.get(id));
}

// ---------- categories ----------

export async function addCategory(restaurantId, { name }) {
  const c = await inRestaurant(restaurantId, (r) => {
    if (r.categories.length >= MAX_CATEGORIES) throw badRequest(`Maximum ${MAX_CATEGORIES} categories`);
    const category = { id: newId('c'), name, items: [], createdAt: nowIso() };
    r.categories.push(category);
    return category;
  });
  return serializeCategory(c);
}

export async function updateCategory(restaurantId, categoryId, { name }) {
  const c = await inRestaurant(restaurantId, (r) => {
    const category = findCategory(r, categoryId);
    category.name = name;
    return category;
  });
  return serializeCategory(c);
}

export async function deleteCategory(restaurantId, categoryId) {
  const removed = await inRestaurant(restaurantId, (r) => {
    const category = findCategory(r, categoryId);
    r.categories = r.categories.filter((c) => c !== category);
    return category;
  });
  await Promise.all(removed.items.map((i) => removeUpload(i.image)));
}

export function reorderCategories(restaurantId, ids) {
  return inRestaurant(restaurantId, (r) => {
    r.categories = reorder(r.categories, ids);
    return r.categories.map((c) => c.id);
  });
}

// ---------- items ----------

export async function addItem(restaurantId, categoryId, input, file) {
  const item = await withUpload('items', file, (image) => inRestaurant(restaurantId, (r) => {
    const c = findCategory(r, categoryId);
    if (c.items.length >= MAX_ITEMS_PER_CATEGORY) throw badRequest(`Maximum ${MAX_ITEMS_PER_CATEGORY} items per category`);
    const newItem = {
      id: newId('i'),
      name: input.name,
      description: input.description ?? '',
      price: roundPrice(input.price),
      image,
      isAvailable: input.isAvailable ?? true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    c.items.push(newItem);
    return newItem;
  }));
  return serializeItem(item);
}

export async function updateItem(restaurantId, categoryId, itemId, input, file) {
  let oldImage = null;
  const item = await withUpload('items', file, (newImage) => inRestaurant(restaurantId, (r) => {
    const it = findItem(findCategory(r, categoryId), itemId);
    for (const k of ['name', 'description', 'isAvailable']) if (input[k] !== undefined) it[k] = input[k];
    if (input.price !== undefined) it.price = roundPrice(input.price);
    oldImage = null;
    if (newImage || input.removeImage) {
      oldImage = it.image;
      it.image = newImage;
    }
    it.updatedAt = nowIso();
    return it;
  }));
  if (oldImage) await removeUpload(oldImage);
  return serializeItem(item);
}

export async function deleteItem(restaurantId, categoryId, itemId) {
  const removed = await inRestaurant(restaurantId, (r) => {
    const c = findCategory(r, categoryId);
    const it = findItem(c, itemId);
    c.items = c.items.filter((x) => x !== it);
    return it;
  });
  await removeUpload(removed.image);
}

export function reorderItems(restaurantId, categoryId, ids) {
  return inRestaurant(restaurantId, (r) => {
    const c = findCategory(r, categoryId);
    c.items = reorder(c.items, ids);
    return c.items.map((i) => i.id);
  });
}
