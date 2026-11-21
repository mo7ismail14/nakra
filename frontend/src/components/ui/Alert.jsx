import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../../utils/helpers.js';

const VARIANTS = {
  error: { icon: CircleAlert, className: 'border-red-200 bg-red-50 text-red-800' },
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  warning: { icon: TriangleAlert, className: 'border-amber-200 bg-amber-50 text-amber-800' },
  info: { icon: Info, className: 'border-sky-200 bg-sky-50 text-sky-800' },
};

export default function Alert({ variant = 'info', title, children, className }) {
  const { icon: Icon, className: colors } = VARIANTS[variant];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3 text-sm', colors, className)} role={variant === 'error' ? 'alert' : undefined}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1 leading-6">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

/** Shows the general error of a useForm() form, if any. */
export function FormError({ form }) {
  return form.formError ? <Alert variant="error">{form.formError}</Alert> : null;
}
