import { UtensilsCrossed } from 'lucide-react';
import { cn } from '../../utils/helpers.js';

export default function Brand({ className, inverted = false }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xl font-bold', inverted ? 'text-white' : 'text-slate-900', className)}>
      <span className={cn('rounded-lg p-1.5', inverted ? 'bg-white/15' : 'bg-brand-700 text-white')}>
        <UtensilsCrossed className="size-5" />
      </span>
      Nakra
    </span>
  );
}
