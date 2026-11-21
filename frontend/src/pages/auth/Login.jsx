import { LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormError } from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { AuthHeading } from '../../layouts/AuthLayout.jsx';
import { homePath } from '../../utils/roles.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    initial: { email: '', password: '' },
    validate: (v) => ({
      email: !v.email.trim() ? 'اكتب الإيميل' : undefined,
      password: !v.password ? 'اكتب كلمة المرور' : undefined,
    }),
    onSubmit: (v) => login(v.email, v.password),
    onSuccess: (user) => navigate(location.state?.from || homePath(user), { replace: true }),
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <AuthHeading title="تسجيل الدخول" subtitle="ادخل على لوحة تحكم Nakra" />
      <Input label="الإيميل" type="email" autoComplete="email" ltr autoFocus {...form.field('email')} />
      <Input label="كلمة المرور" type="password" autoComplete="current-password" {...form.field('password')} />
      <div className="text-end">
        <Link to="/forgot-password" className="text-sm text-brand-700 hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </div>
      <FormError form={form} />
      <Button type="submit" size="lg" icon={LogIn} className="w-full justify-center" loading={form.submitting}>
        دخول
      </Button>
    </form>
  );
}
