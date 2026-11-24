import { useState } from 'react';
import { menuApi } from '../../api/endpoints.js';
import { useForm } from '../../hooks/useForm.js';
import { toFormData } from '../../utils/helpers.js';
import { FormError } from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import ImageUpload from '../ui/ImageUpload.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';
import Switch from '../ui/Switch.jsx';

function validate(v) {
  const price = Number(v.price);
  return {
    name: !v.name.trim() ? 'اكتب اسم الصنف' : undefined,
    price: v.price === '' || Number.isNaN(price) || price < 0 ? 'اكتب سعر صحيح' : undefined,
  };
}

/** Add (no `item`) or edit an item in a category. Mount it only while open. */
export default function ItemFormModal({ restaurantId, categoryId, item, onClose, onSaved }) {
  const [image, setImage] = useState({ file: null, removed: false });

  const form = useForm({
    initial: {
      name: item?.name ?? '',
      price: item ? String(item.price) : '',
      description: item?.description ?? '',
      isAvailable: item?.isAvailable ?? true,
    },
    validate,
    onSubmit: (v) => {
      const removeImage = item && image.removed && !image.file ? { removeImage: true } : {};
      const body = toFormData({ ...v, name: v.name.trim(), ...removeImage }, { image: image.file });
      return item
        ? menuApi.updateItem(restaurantId, categoryId, item.id, body)
        : menuApi.addItem(restaurantId, categoryId, body);
    },
    onSuccess: ({ item: saved }) => {
      onSaved(saved);
      onClose();
    },
    successMessage: item ? 'تم تعديل الصنف' : 'تم إضافة الصنف',
  });

  const available = form.field('isAvailable');

  return (
    <Modal
      open
      onClose={onClose}
      title={item ? 'تعديل الصنف' : 'صنف جديد'}
      as="form"
      onSubmit={form.handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={form.submitting}>{item ? 'حفظ' : 'إضافة'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <ImageUpload label="صورة الصنف" currentUrl={item?.imageUrl} onChange={(file, removed) => setImage({ file, removed })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="اسم الصنف" autoFocus className="sm:col-span-2" {...form.field('name')} />
          <Input label="السعر (جنيه)" type="number" inputMode="decimal" min="0" step="0.01" ltr {...form.field('price')} />
        </div>
        <Input label="وصف (اختياري)" multiline rows={2} maxLength={300} {...form.field('description')} />
        <Switch label="متاح" description="لو مقفول، الصنف بيظهر للزبون إنه غير متاح" value={available.value} onChange={available.onChange} />
        <FormError form={form} />
      </div>
    </Modal>
  );
}
