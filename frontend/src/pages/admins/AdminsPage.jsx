import { CheckCircle2, Clock, Mail, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { adminsApi } from '../../api/endpoints.js';
import AddAdminModal from '../../components/admins/AddAdminModal.jsx';
import AsyncContent from '../../components/ui/AsyncContent.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { SharedLinkModal } from '../../components/ui/SharedLinkResult.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { formatDate } from '../../utils/format.js';
import { ROLE_LABELS, ROLES } from '../../utils/roles.js';

export default function AdminsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const query = useApi(() => adminsApi.list(), []);
  const [adding, setAdding] = useState(false);
  const [linkResult, setLinkResult] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const resend = useAction((admin) => adminsApi.resendSetup(admin.id), {
    onSuccess: (res, admin) => setLinkResult({ link: res.setupLink, emailSent: res.emailSent, email: admin.email }),
  });
  const remove = useAction((admin) => adminsApi.remove(admin.id), {
    successMessage: 'تم مسح المسؤول',
    onSuccess: (_, admin) => query.setData((d) => ({ admins: d.admins.filter((a) => a.id !== admin.id) })),
  });

  const withBusy = (admin, action) => async () => {
    setBusyId(admin.id);
    await action.run(admin);
    setBusyId(null);
  };

  const onDelete = async (admin) => {
    const ok = await confirm({ title: 'مسح المسؤول؟', message: `${admin.email} مش هيقدر يدخل على لوحة التحكم تاني.`, confirmText: 'مسح' });
    if (ok) withBusy(admin, remove)();
  };

  const onCreated = ({ user: created, setupLink, emailSent }) => {
    setAdding(false);
    query.setData((d) => ({ admins: [...d.admins, created] }));
    setLinkResult({ link: setupLink, emailSent, email: created.email });
  };

  return (
    <>
      <PageHeader
        title="المسؤولين"
        description="الأشخاص اللي يقدروا يدخلوا لوحة التحكم ويديروا كل المطاعم."
        actions={<Button icon={UserPlus} onClick={() => setAdding(true)}>إضافة مسؤول</Button>}
      />

      <AsyncContent query={query}>
        {({ admins }) => (
          <Card bodyClassName="p-0">
            <ul className="divide-y divide-slate-100">
              {admins.map((admin) => {
                const isSuper = admin.role === ROLES.SUPERADMIN;
                const busy = busyId === admin.id;
                return (
                  <li key={admin.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 basis-full sm:basis-auto sm:flex-1">
                      <p dir="ltr" className="truncate text-end font-medium text-slate-900">{admin.email}</p>
                      <p className="text-xs text-slate-500">اتضاف {formatDate(admin.createdAt)}</p>
                    </div>
                    <Badge color={isSuper ? 'brand' : 'gray'}>{ROLE_LABELS[admin.role]}</Badge>
                    {admin.hasPassword ? (
                      <Badge color="green" icon={CheckCircle2}>نشط</Badge>
                    ) : (
                      <Badge color="amber" icon={Clock}>مستني يعيّن الباسورد</Badge>
                    )}
                    {!isSuper && admin.id !== user.id && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" icon={Mail} onClick={withBusy(admin, resend)} disabled={busy}>
                          إعادة إرسال اللينك
                        </Button>
                        <Button variant="ghost" size="icon" icon={Trash2} className="hover:text-red-600" onClick={() => onDelete(admin)} loading={busy} aria-label="مسح" title="مسح" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </AsyncContent>

      {adding && <AddAdminModal onClose={() => setAdding(false)} onCreated={onCreated} />}
      {linkResult && <SharedLinkModal title="لينك تعيين كلمة المرور" result={linkResult} onClose={() => setLinkResult(null)} />}
    </>
  );
}
