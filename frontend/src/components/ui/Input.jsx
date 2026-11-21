import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../utils/helpers.js';

const base =
  'block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-50';
const normal = 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20';
const invalid = 'border-red-400 focus:border-red-500 focus:ring-red-500/20';

/** Label + control + hint/error. Used by Input and anything else that needs the same frame. */
export function Field({ id, label, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ms-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

/**
 * <Input label="..." error="..." hint="..." />, also multiline (<Input multiline rows={3} />)
 * and password with a show/hide button (type="password"). `ltr` for emails, links, phones.
 */
export default function Input({ label, hint, error, required, multiline, ltr, className, type = 'text', ...props }) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputClass = cn(base, error ? invalid : normal, multiline ? 'py-2' : 'h-10', isPassword && 'pe-10');
  const common = {
    id,
    dir: ltr || isPassword ? 'ltr' : undefined,
    'aria-invalid': Boolean(error),
    required,
    ...props,
  };

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      {multiline ? (
        <textarea className={inputClass} rows={3} {...common} />
      ) : (
        // Same direction as the input, so the eye button and the padding are on the same side
        <div className="relative" dir={common.dir}>
          <input type={isPassword && showPassword ? 'text' : type} className={inputClass} {...common} />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      )}
    </Field>
  );
}
