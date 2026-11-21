import { LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Alert, { FormError } from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import { PageLoader } from '../ui/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useForm } from '../../hooks/useForm.js';
import { AuthHeading } from '../../layouts/AuthLayout.jsx';
import { homePath } from '../../utils/roles.js';

export const MIN_PASSWORD = 8;

function validatePasswords({ password, confirm }) {
  return {
    password: password.length < MIN_PASSWORD ? `كلمة المرور لازم تكون ${MIN_PASSWORD} حروف على الأقل` : undefined,
    confirm: password !== confirm ? 'كلمتين المرور مش متطابقين' : undefined,
  };
}

/**
 * Shared by "reset password" and "accept invitation": both open a link with a token,
 * show who it is for, ask for a new password, then log the user in.
 */
export default function SetPasswordPage({ loadInfo, title, subtitle, submit, submitLabel }) {
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const info = useApi(loadInfo, []);

  const form = useForm({
    initial: { password: '', confirm: '' },
    validate: validatePasswords,
    onSubmit: ({ password }) => submit(password),
    onSuccess: (session) => navigate(homePath(startSession(session)), { replace: true }),
    successMessage: 'تم حفظ كلمة المرور، أهلاً بيك',
  });

  if (info.loading) return <PageLoader />;
  if (info.error) {
    return (
      <div className="space-y-5 text-center">
        <AuthHeading title="الرابط مش صالح" />
        <Alert variant="error">{info.error.message}. لو الرابط قديم اطلب رابط جديد.</Alert>
        <div className="flex justify-center gap-2">
          <Button to="/forgot-password" icon={LinkIcon} variant="secondary">طلب رابط جديد</Button>
          <Button to="/login">تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <AuthHeading title={title(info.data)} subtitle={subtitle(info.data)} />
      <Input label="الإيميل" value={info.data.email} ltr disabled readOnly />
      <Input label="كلمة المرور الجديدة" type="password" autoComplete="new-password" hint={`${MIN_PASSWORD} حروف على الأقل`} autoFocus {...form.field('password')} />
      <Input label="تأكيد كلمة المرور" type="password" autoComplete="new-password" {...form.field('confirm')} />
      <FormError form={form} />
      <Button type="submit" size="lg" className="w-full justify-center" loading={form.submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
