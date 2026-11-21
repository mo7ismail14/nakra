import { Router } from 'express';
import * as c from '../controllers/menu.controller.js';
import { uploadItemImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { categorySchema, itemCreateSchema, itemUpdateSchema, reorderSchema } from '../validators/menu.schema.js';

// Mounted at /api/restaurants/:id (auth + restaurant access already checked).
const router = Router({ mergeParams: true });

router.post('/categories', validate(categorySchema), c.addCategory);
router.put('/categories/order', validate(reorderSchema), c.reorderCategories);
router.patch('/categories/:categoryId', validate(categorySchema), c.updateCategory);
router.delete('/categories/:categoryId', c.deleteCategory);

router.post('/categories/:categoryId/items', uploadItemImage, validate(itemCreateSchema), c.addItem);
router.put('/categories/:categoryId/items/order', validate(reorderSchema), c.reorderItems);
router.patch('/categories/:categoryId/items/:itemId', uploadItemImage, validate(itemUpdateSchema), c.updateItem);
router.delete('/categories/:categoryId/items/:itemId', c.deleteItem);

export default router;
