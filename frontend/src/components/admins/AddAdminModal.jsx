import { adminsApi } from '../../api/endpoints.js';
import { useForm } from '../../hooks/useForm.js';
import { FormError } from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';

export default function AddAdminModal({ onClose, onCreated }) {
  const form = useForm({
    initial: { email: '' },
    validate: (v) => ({ email: !v.email.trim() ? 'اكتب الإيميل' : undefined }),
    onSubmit: (v) => adminsApi.create(v.email.trim()),
    onSuccess: onCreated,
    successMessage: 'تم إضافة المسؤول',
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="إضافة مسؤول"
      size="sm"
      as="form"
      onSubmit={form.handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={form.submitting}>إضافة وإرسال الدعوة</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-600">هيوصله إيميل فيه لينك يعيّن منه كلمة المرور. المسؤول يقدر يدير كل المطاعم، لكن ما يقدرش يضيف مسؤولين.</p>
        <Input label="الإيميل" type="email" ltr autoFocus {...form.field('email')} />
        <FormError form={form} />
      </div>
    </Modal>
  );
}
