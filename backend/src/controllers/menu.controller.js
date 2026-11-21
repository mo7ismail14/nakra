import * as menu from '../services/menu.service.js';

export async function addCategory(req, res) {
  res.status(201).json({ category: await menu.addCategory(req.params.id, req.body) });
}

export async function updateCategory(req, res) {
  res.json({ category: await menu.updateCategory(req.params.id, req.params.categoryId, req.body) });
}

export async function deleteCategory(req, res) {
  await menu.deleteCategory(req.params.id, req.params.categoryId);
  res.status(204).end();
}

export async function reorderCategories(req, res) {
  res.json({ ids: await menu.reorderCategories(req.params.id, req.body.ids) });
}

export async function addItem(req, res) {
  res.status(201).json({ item: await menu.addItem(req.params.id, req.params.categoryId, req.body, req.file) });
}

export async function updateItem(req, res) {
  const { id: restaurantId, categoryId: cid, itemId: iid } = req.params;
  res.json({ item: await menu.updateItem(restaurantId, cid, iid, req.body, req.file) });
}

export async function deleteItem(req, res) {
  await menu.deleteItem(req.params.id, req.params.categoryId, req.params.itemId);
  res.status(204).end();
}

export async function reorderItems(req, res) {
  res.json({ ids: await menu.reorderItems(req.params.id, req.params.categoryId, req.body.ids) });
}
