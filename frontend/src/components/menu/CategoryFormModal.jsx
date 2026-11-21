import { menuApi } from '../../api/endpoints.js';
import { useForm } from '../../hooks/useForm.js';
import { FormError } from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';

/** Add (no `category`) or rename a category. Mount it only while open. */
export default function CategoryFormModal({ restaurantId, category, onClose, onSaved }) {
  const form = useForm({
    initial: { name: category?.name ?? '' },
    validate: (v) => ({ name: !v.name.trim() ? 'اكتب اسم القسم' : undefined }),
    onSubmit: (v) =>
      category
        ? menuApi.updateCategory(restaurantId, category.id, v.name.trim())
        : menuApi.addCategory(restaurantId, v.name.trim()),
    onSuccess: ({ category: saved }) => {
      onSaved(saved);
      onClose();
    },
    successMessage: category ? 'تم تعديل القسم' : 'تم إضافة القسم',
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={category ? 'تعديل القسم' : 'قسم جديد'}
      size="sm"
      as="form"
      onSubmit={form.handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={form.submitting}>{category ? 'حفظ' : 'إضافة'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="اسم القسم" placeholder="مثلاً: مشروبات ساخنة" autoFocus {...form.field('name')} />
        <FormError form={form} />
      </div>
    </Modal>
  );
}
