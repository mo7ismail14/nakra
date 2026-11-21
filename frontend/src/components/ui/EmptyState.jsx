import { cn } from '../../utils/helpers.js';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-brand-50 p-3 text-brand-700">
          <Icon className="size-6" />
        </div>
      )}
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
