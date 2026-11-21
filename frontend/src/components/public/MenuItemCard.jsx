import { formatPrice } from '../../utils/format.js';
import { cn } from '../../utils/helpers.js';
import Badge from '../ui/Badge.jsx';

export default function MenuItemCard({ item }) {
  return (
    <article className={cn('flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100', !item.isAvailable && 'opacity-60')}>
      <div className="min-w-0 flex-1 py-1">
        <h3 className="font-semibold text-slate-900">{item.name}</h3>
        {item.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{item.description}</p>}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-brand-700">{formatPrice(item.price)}</span>
          {!item.isAvailable && <Badge color="red">غير متاح حالياً</Badge>}
        </div>
      </div>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} loading="lazy" className={cn('size-24 shrink-0 rounded-xl object-cover', !item.isAvailable && 'grayscale')} />
      )}
    </article>
  );
}
