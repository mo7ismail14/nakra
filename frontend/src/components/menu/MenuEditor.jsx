import { LayoutList, Plus } from 'lucide-react';
import { useState } from 'react';
import { menuApi } from '../../api/endpoints.js';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { moveItem } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import CategoryFormModal from './CategoryFormModal.jsx';
import CategorySection from './CategorySection.jsx';
import ItemFormModal from './ItemFormModal.jsx';

/**
 * Categories + items editor. `categories` lives in the page (single source of truth);
 * every change here calls the API, then updates it through setCategories.
 */
export default function MenuEditor({ restaurantId, categories, setCategories }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [categoryModal, setCategoryModal] = useState(null); // { category? }
  const [itemModal, setItemModal] = useState(null); // { category, item? }

  const patchCategory = (categoryId, fn) =>
    setCategories((list) => list.map((c) => (c.id === categoryId ? fn(c) : c)));

  /**
   * Runs an API call and returns true if it worked. On failure: restores the previous
   * state (for optimistic updates) and shows the error.
   */
  const attempt = async (call, { success, rollback } = {}) => {
    try {
      await call();
      if (success) toast.success(success);
      return true;
    } catch (err) {
      rollback?.();
      toast.error(err.message);
      return false;
    }
  };

  const actions = {
    editCategory: (category) => setCategoryModal({ category }),

    async deleteCategory(category) {
      const ok = await confirm({
        title: `مسح قسم "${category.name}"؟`,
        message: category.items.length
          ? `هيتمسح القسم و ${category.items.length} صنف جواه بصورهم. مينفعش ترجع في ده.`
          : 'مينفعش ترجع في ده.',
        confirmText: 'مسح القسم',
      });
      if (!ok) return;
      if (await attempt(() => menuApi.deleteCategory(restaurantId, category.id), { success: 'تم مسح القسم' }))
        setCategories((list) => list.filter((c) => c.id !== category.id));
    },

    moveCategory(index, step) {
      const previous = categories;
      const next = moveItem(categories, index, step);
      setCategories(next);
      attempt(() => menuApi.reorderCategories(restaurantId, next.map((c) => c.id)), {
        rollback: () => setCategories(previous),
      });
    },

    addItem: (category) => setItemModal({ category }),
    editItem: (category, item) => setItemModal({ category, item }),

    async deleteItem(category, item) {
      const ok = await confirm({ title: `مسح "${item.name}"؟`, message: 'الصنف هيتمسح بصورته. مينفعش ترجع في ده.', confirmText: 'مسح الصنف' });
      if (!ok) return;
      if (await attempt(() => menuApi.deleteItem(restaurantId, category.id, item.id), { success: 'تم مسح الصنف' }))
        patchCategory(category.id, (c) => ({ ...c, items: c.items.filter((i) => i.id !== item.id) }));
    },

    moveItem(category, index, step) {
      const previous = category.items;
      const next = moveItem(category.items, index, step);
      patchCategory(category.id, (c) => ({ ...c, items: next }));
      attempt(() => menuApi.reorderItems(restaurantId, category.id, next.map((i) => i.id)), {
        rollback: () => patchCategory(category.id, (c) => ({ ...c, items: previous })),
      });
    },

    toggleItem(category, item, isAvailable) {
      const setAvailable = (value) =>
        patchCategory(category.id, (c) => ({ ...c, items: c.items.map((i) => (i.id === item.id ? { ...i, isAvailable: value } : i)) }));
      setAvailable(isAvailable);
      attempt(() => menuApi.updateItem(restaurantId, category.id, item.id, { isAvailable }), {
        rollback: () => setAvailable(!isAvailable),
      });
    },
  };

  const onCategorySaved = (saved) =>
    setCategories((list) => (list.some((c) => c.id === saved.id) ? list.map((c) => (c.id === saved.id ? saved : c)) : [...list, saved]));

  const onItemSaved = (categoryId) => (saved) =>
    patchCategory(categoryId, (c) => ({
      ...c,
      items: c.items.some((i) => i.id === saved.id) ? c.items.map((i) => (i.id === saved.id ? saved : i)) : [...c.items, saved],
    }));

  return (
    <div className="space-y-4">
      {categories.length ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {categories.length} قسم · {categories.reduce((n, c) => n + c.items.length, 0)} صنف. رتّب بالأسهم، والترتيب ده هو اللي بيظهر للزبون.
            </p>
            <Button icon={Plus} onClick={() => setCategoryModal({})}>قسم جديد</Button>
          </div>
          {categories.map((category, index) => (
            <CategorySection key={category.id} category={category} index={index} count={categories.length} actions={actions} />
          ))}
        </>
      ) : (
        <EmptyState
          icon={LayoutList}
          title="المنيو لسه فاضي"
          description="ابدأ بإضافة قسم (زي مشروبات، حلويات...) وبعدها ضيف الأصناف جواه."
          action={<Button icon={Plus} onClick={() => setCategoryModal({})}>إضافة أول قسم</Button>}
        />
      )}

      {categoryModal && (
        <CategoryFormModal
          restaurantId={restaurantId}
          category={categoryModal.category}
          onClose={() => setCategoryModal(null)}
          onSaved={onCategorySaved}
        />
      )}
      {itemModal && (
        <ItemFormModal
          restaurantId={restaurantId}
          categoryId={itemModal.category.id}
          item={itemModal.item}
          onClose={() => setItemModal(null)}
          onSaved={onItemSaved(itemModal.category.id)}
        />
      )}
    </div>
  );
}
