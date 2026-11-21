import { cn } from '../../utils/helpers.js';

/** On/off toggle. onChange receives the new boolean. */
export default function Switch({ value, onChange, label, description, disabled, size = 'md' }) {
  const small = size === 'sm';
  return (
    <label className={cn('inline-flex items-center gap-3', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700',
          small ? 'h-5 w-9' : 'h-6 w-11',
          value ? 'bg-brand-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 rounded-full bg-white shadow transition-all',
            small ? 'size-4' : 'size-5',
            // RTL: "on" moves the knob to the end (left side)
            !value ? 'start-0.5' : small ? 'start-[1.125rem]' : 'start-[1.375rem]',
          )}
        />
      </button>
      {(label || description) && !small && (
        <span>
          <span className="block text-sm font-medium text-slate-700">{label}</span>
          {description && <span className="block text-xs text-slate-500">{description}</span>}
        </span>
      )}
    </label>
  );
}
