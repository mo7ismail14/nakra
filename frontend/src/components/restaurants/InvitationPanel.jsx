import { Clock, MailPlus, RotateCw, UserCheck, UserMinus, XCircle } from 'lucide-react';
import { useState } from 'react';
import { restaurantsApi } from '../../api/endpoints.js';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useForm } from '../../hooks/useForm.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import Alert, { FormError } from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import SharedLinkResult from '../ui/SharedLinkResult.jsx';

/** Staff only: invite the restaurant owner, see the status, revoke, or remove his account. */
export default function InvitationPanel({ restaurant, onChanged }) {
  const confirm = useConfirm();
  const [result, setResult] = useState(null);
  const { ownerAccount, pendingInvitation } = restaurant;

  const form = useForm({
    initial: { email: pendingInvitation?.email || restaurant.email || '' },
    validate: (v) => ({ email: !v.email.trim() ? 'اكتب إيميل صاحب المطعم' : undefined }),
    onSubmit: (v) => restaurantsApi.sendInvitation(restaurant.id, v.email.trim()),
    onSuccess: (res) => {
      setResult(res);
      onChanged();
    },
    successMessage: 'تم تجهيز الدعوة',
  });

  const revoke = useAction(() => restaurantsApi.revokeInvitation(restaurant.id), {
    successMessage: 'تم إلغاء الدعوة',
    onSuccess: () => {
      setResult(null);
      onChanged();
    },
  });

  const removeOwner = useAction(() => restaurantsApi.removeOwner(restaurant.id), {
    successMessage: 'تم إزالة حساب المالك',
    onSuccess: onChanged,
  });

  if (ownerAccount) {
    const onRemove = async () => {
      const ok = await confirm({
        title: 'إزالة حساب المالك؟',
        message: `${ownerAccount.email} مش هيقدر يدخل على المطعم تاني. تقدر تبعتله دعوة جديدة بعد كده.`,
        confirmText: 'إزالة الحساب',
      });
      if (ok) removeOwner.run();
    };
    return (
      <Card title="حساب صاحب المطعم">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 p-2.5 text-emerald-700">
              <UserCheck className="size-5" />
            </span>
            <div>
              <p dir="ltr" className="text-end font-medium text-slate-900">{ownerAccount.email}</p>
              <p className="text-sm text-slate-500">عنده حساب من {formatDate(ownerAccount.createdAt)} ويقدر يعدّل المطعم والمنيو.</p>
            </div>
          </div>
          <Button variant="danger-ghost" icon={UserMinus} onClick={onRemove} loading={removeOwner.running}>
            إزالة الحساب
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="دعوة صاحب المطعم"
      description="بيوصله إيميل فيه لينك يعمل منه كلمة مرور، وبعدها يقدر يدير مطعمه بنفسه (من غير ما يمسحه)."
    >
      <div className="max-w-xl space-y-4">
        {pendingInvitation && !result && (
          <Alert variant="info" title="فيه دعوة مستنية">
            <span className="flex items-start gap-1">
              <Clock className="mt-1 size-4 shrink-0" />
              <span>اتبعتت لـ <span dir="ltr" className="break-all">{pendingInvitation.email}</span> وصالحة لحد {formatDateTime(pendingInvitation.expiresAt)}.</span>
            </span>
          </Alert>
        )}

        {result && <SharedLinkResult {...result} />}

        <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
          <Input label="إيميل صاحب المطعم" type="email" ltr {...form.field('email')} />
          <FormError form={form} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" icon={pendingInvitation ? RotateCw : MailPlus} loading={form.submitting}>
              {pendingInvitation ? 'إعادة إرسال الدعوة' : 'إرسال الدعوة'}
            </Button>
            {pendingInvitation && (
              <Button variant="danger-ghost" icon={XCircle} onClick={() => revoke.run()} loading={revoke.running}>
                إلغاء الدعوة
              </Button>
            )}
          </div>
        </form>
      </div>
    </Card>
  );
}
