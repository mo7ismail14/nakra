import { MailCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/endpoints.js';
import Alert, { FormError } from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useForm } from '../../hooks/useForm.js';
import { AuthHeading } from '../../layouts/AuthLayout.jsx';

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState('');

  const form = useForm({
    initial: { email: '' },
    validate: (v) => ({ email: !v.email.trim() ? 'اكتب الإيميل' : undefined }),
    onSubmit: (v) => authApi.forgotPassword(v.email),
    onSuccess: (_, v) => setSentTo(v.email),
  });

  if (sentTo) {
    return (
      <div className="space-y-5 text-center">
        <MailCheck className="mx-auto size-12 text-brand-700" />
        <AuthHeading title="شوف الإيميل بتاعك" />
        <Alert variant="success">
          لو الإيميل <span dir="ltr">{sentTo}</span> مسجّل عندنا، هيوصلك رابط لتعيين كلمة مرور جديدة خلال دقايق. الرابط صالح لمدة ساعة.
        </Alert>
        <Button to="/login" variant="secondary">الرجوع لتسجيل الدخول</Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <AuthHeading title="نسيت كلمة المرور؟" subtitle="اكتب الإيميل بتاعك وهنبعتلك رابط لتعيين كلمة مرور جديدة." />
      <Input label="الإيميل" type="email" autoComplete="email" ltr autoFocus {...form.field('email')} />
      <FormError form={form} />
      <Button type="submit" size="lg" icon={Send} className="w-full justify-center" loading={form.submitting}>
        إرسال الرابط
      </Button>
      <p className="text-center text-sm">
        <Link to="/login" className="text-brand-700 hover:underline">
          الرجوع لتسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
