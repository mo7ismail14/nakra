import { LayoutList, Mail, Phone, Trash2, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import RestaurantLogo from './RestaurantLogo.jsx';

export default function RestaurantCard({ restaurant, onDelete, deleting }) {
  const r = restaurant;
  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <RestaurantLogo name={r.name} logoUrl={r.logoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">
            {/* The whole card is clickable through this link */}
            <Link to={`/restaurants/${r.id}`} className="after:absolute after:inset-0 after:rounded-2xl">
              {r.name}
            </Link>
          </h3>
          <p className="truncate text-sm text-slate-500">{r.ownerName}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          icon={Trash2}
          className="relative z-10 text-slate-400 hover:text-red-600"
          onClick={() => onDelete(r)}
          loading={deleting}
          aria-label={`مسح ${r.name}`}
          title="مسح"
        />
      </div>

      <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
        {r.email && (
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-slate-400" />
            <span dir="ltr" className="truncate">{r.email}</span>
          </div>
        )}
        {r.phone && (
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-slate-400" />
            <span dir="ltr">{r.phone}</span>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Badge icon={LayoutList}>
          {r.categoriesCount} قسم · {r.itemsCount} صنف
        </Badge>
        {r.hasOwnerAccount ? (
          <Badge color="green" icon={UserCheck}>المالك عنده حساب</Badge>
        ) : (
          <Badge color="amber" icon={UserX}>المالك لسه ما دخلش</Badge>
        )}
      </div>
    </article>
  );
}
