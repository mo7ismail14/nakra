import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers.js';

export default function Spinner({ className }) {
  return <Loader2 className={cn('size-6 animate-spin text-brand-700', className)} aria-label="جاري التحميل" />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
