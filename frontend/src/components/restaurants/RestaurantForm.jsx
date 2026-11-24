import { Save } from 'lucide-react';
import { useState } from 'react';
import { restaurantsApi } from '../../api/endpoints.js';
import { useForm } from '../../hooks/useForm.js';
import { toFormData } from '../../utils/helpers.js';
import { FormError } from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import ImageUpload from '../ui/ImageUpload.jsx';
import Input from '../ui/Input.jsx';

const FIELDS = ['name', 'ownerName', 'email', 'phone', 'slug', 'instapayLink', 'vodafoneCashNumber', 'vodafoneCashInstapayLink'];

function initialValues(r) {
  const flat = { ...r, ...r?.payments };
  return Object.fromEntries(FIELDS.map((k) => [k, flat?.[k] ?? '']));
}

function validate(v) {
  return {
    name: v.name.trim().length < 2 ? 'اكتب اسم المطعم (حرفين على الأقل)' : undefined,
    ownerName: v.ownerName.trim().length < 2 ? 'اكتب اسم صاحب المطعم' : undefined,
    email: !v.email.trim() && !v.phone.trim() ? 'لازم إيميل أو رقم موبايل' : undefined,
  };
}

/** Create (no `restaurant`) or edit (with `restaurant`). Calls onSaved(restaurant) after saving. */
export default function RestaurantForm({ restaurant, onSaved }) {
  const isEdit = Boolean(restaurant);
  const [logo, setLogo] = useState({ file: null, removed: false });

  const form = useForm({
    initial: initialValues(restaurant),
    validate,
    onSubmit: (values) => {
      const removeLogo = isEdit && logo.removed && !logo.file ? { removeLogo: true } : {};
      const body = toFormData({ ...values, ...removeLogo }, { logo: logo.file });
      return isEdit ? restaurantsApi.update(restaurant.id, body) : restaurantsApi.create(body);
    },
    onSuccess: ({ restaurant: saved }) => {
      setLogo({ file: null, removed: false });
      onSaved(saved);
    },
    successMessage: isEdit ? 'تم حفظ التعديلات' : 'تم إضافة المطعم',
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-6">
      <Card title="بيانات المطعم">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ImageUpload
            label="لوجو المطعم"
            currentUrl={restaurant?.logoUrl}
            onChange={(file, removed) => setLogo({ file, removed })}
            error={form.errors.logo}
            className="sm:col-span-2"
          />
          <Input label="اسم المطعم" required {...form.field('name')} />
          <Input label="اسم صاحب المطعم" required {...form.field('ownerName')} />
          <Input label="الإيميل" type="email" ltr hint="بنبعت عليه دعوة صاحب المطعم" {...form.field('email')} />
          <Input label="رقم الموبايل" type="tel" ltr placeholder="01xxxxxxxxx" {...form.field('phone')} />
        </div>
      </Card>

      <Card title="وسائل الدفع" description="بتظهر للزبون في صفحة المنيو، وبيتعملها QR code.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="لينك إنستاباي" ltr placeholder="https://ipn.eg/S/..." className="sm:col-span-2" {...form.field('instapayLink')} />
          <Input label="رقم فودافون كاش" type="tel" ltr placeholder="010xxxxxxxx" {...form.field('vodafoneCashNumber')} />
          <Input
            label="لينك إنستاباي لمحفظة فودافون كاش"
            ltr
            placeholder="https://ipn.eg/S/..."
            hint="لينك الدفع على المحفظة من خلال إنستاباي"
            {...form.field('vodafoneCashInstapayLink')}
          />
        </div>
      </Card>

      <Card title="رابط المنيو">
        <Input
          label="الجزء الأخير من الرابط"
          ltr
          placeholder="cafe-nile"
          hint={isEdit ? `الرابط الحالي: ${restaurant.menuUrl} (لو غيرته، الـ QR القديم مش هيشتغل)` : 'سيبه فاضي وهيتعمل لوحده من اسم المطعم'}
          {...form.field('slug')}
        />
      </Card>

      <FormError form={form} />
      <div className="flex justify-end">
        <Button type="submit" size="lg" icon={Save} loading={form.submitting}>
          {isEdit ? 'حفظ التعديلات' : 'إضافة المطعم'}
        </Button>
      </div>
    </form>
  );
}
