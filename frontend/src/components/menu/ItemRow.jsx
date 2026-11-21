import { ImageOff, Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/format.js';
import { cn } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';
import MoveButtons from '../ui/MoveButtons.jsx';
import Switch from '../ui/Switch.jsx';

export default function ItemRow({ item, index, count, onMove, onEdit, onDelete, onToggle }) {
  return (
    <li className={cn('flex items-center gap-3 px-3 py-3 sm:px-4', !item.isAvailable && 'bg-slate-50/70')}>
      <MoveButtons index={index} count={count} onMove={onMove} />
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className={cn('size-14 shrink-0 rounded-xl object-cover', !item.isAvailable && 'opacity-50 grayscale')} />
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <ImageOff className="size-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-medium', item.isAvailable ? 'text-slate-900' : 'text-slate-500 line-through')}>{item.name}</p>
        {item.description && <p className="truncate text-sm text-slate-500">{item.description}</p>}
        <p className="mt-0.5 text-sm font-semibold text-brand-700">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-1">
        <span title={item.isAvailable ? 'متاح' : 'غير متاح'}>
          <Switch size="sm" label={`${item.name} متاح`} value={item.isAvailable} onChange={onToggle} />
        </span>
        <Button variant="ghost" size="icon" icon={Pencil} onClick={onEdit} aria-label={`تعديل ${item.name}`} title="تعديل" />
        <Button variant="ghost" size="icon" icon={Trash2} onClick={onDelete} className="hover:text-red-600" aria-label={`مسح ${item.name}`} title="مسح" />
      </div>
    </li>
  );
}
