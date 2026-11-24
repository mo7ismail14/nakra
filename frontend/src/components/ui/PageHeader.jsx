import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Page title row: optional back link, title, description and action buttons. */
export default function PageHeader({ title, description, actions, backTo, backLabel = 'رجوع', media }) {
  return (
    <div className="mb-6 space-y-3">
      {backTo && (
        <Link to={backTo} className="-my-1.5 inline-flex items-center gap-1 py-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowRight className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {media}
          <div className="min-w-0">
            <h1 className="line-clamp-2 break-words text-xl font-bold text-slate-900 sm:truncate sm:text-2xl">{title}</h1>
            {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
