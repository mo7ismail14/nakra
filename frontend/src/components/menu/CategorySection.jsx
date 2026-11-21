import { Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import MoveButtons from '../ui/MoveButtons.jsx';
import ItemRow from './ItemRow.jsx';

/** One category with its items. All changes go through `actions` (owned by MenuEditor). */
export default function CategorySection({ category, index, count, actions }) {
  const { items } = category;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2 sm:px-4">
        <MoveButtons index={index} count={count} onMove={(step) => actions.moveCategory(index, step)} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{category.name}</h3>
          <p className="text-xs text-slate-500">{items.length} صنف</p>
        </div>
        <Button variant="ghost" size="icon" icon={Pencil} onClick={() => actions.editCategory(category)} aria-label="تعديل القسم" title="تعديل القسم" />
        <Button variant="ghost" size="icon" icon={Trash2} className="hover:text-red-600" onClick={() => actions.deleteCategory(category)} aria-label="مسح القسم" title="مسح القسم" />
        <Button size="sm" icon={Plus} onClick={() => actions.addItem(category)}>
          صنف
        </Button>
      </header>

      {items.length ? (
        <ul className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              index={i}
              count={items.length}
              onMove={(step) => actions.moveItem(category, i, step)}
              onEdit={() => actions.editItem(category, item)}
              onDelete={() => actions.deleteItem(category, item)}
              onToggle={(isAvailable) => actions.toggleItem(category, item, isAvailable)}
            />
          ))}
        </ul>
      ) : (
        <button
          onClick={() => actions.addItem(category)}
          className="flex w-full items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500 hover:bg-slate-50 hover:text-brand-700"
        >
          <Plus className="size-4" />
          القسم فاضي، ضيف أول صنف
        </button>
      )}
    </section>
  );
}
