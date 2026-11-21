import { cn } from '../../utils/helpers.js';

const COLORS = {
  gray: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-800',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-800',
  red: 'bg-red-50 text-red-700',
};

export default function Badge({ color = 'gray', icon: Icon, children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', COLORS[color], className)}>
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  );
}
