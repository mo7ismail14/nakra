import { useEffect, useRef } from 'react';
import { cn } from '../../utils/helpers.js';

/** tabs: [{ id, label, icon }]. On small screens the strip scrolls; the active tab is kept in view. */
export default function Tabs({ tabs, value, onChange }) {
  const active = useRef(null);

  useEffect(() => {
    active.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value]);

  return (
    <div className="mb-6 overflow-x-auto border-b border-slate-200">
      <nav className="-mb-px flex gap-1" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            ref={value === id ? active : undefined}
            role="tab"
            aria-selected={value === id}
            onClick={() => onChange(id)}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              value === id ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800',
            )}
          >
            {Icon && <Icon className="size-4" />}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
