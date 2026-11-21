import { Plus, Search, Store } from 'lucide-react';
import { useState } from 'react';
import { restaurantsApi } from '../../api/endpoints.js';
import RestaurantCard from '../../components/restaurants/RestaurantCard.jsx';
import AsyncContent from '../../components/ui/AsyncContent.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Input from '../../components/ui/Input.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';

const matches = (r, q) => [r.name, r.ownerName, r.email, r.phone].some((v) => v?.toLowerCase().includes(q));

export default function RestaurantsPage() {
  const query = useApi(() => restaurantsApi.list(), []);
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const remove = useAction((r) => restaurantsApi.remove(r.id), {
    successMessage: 'تم مسح المطعم',
    onSuccess: (_, r) => query.setData((d) => ({ restaurants: d.restaurants.filter((x) => x.id !== r.id) })),
  });

  const onDelete = async (r) => {
    const ok = await confirm({
      title: `مسح "${r.name}"؟`,
      message: 'هيتمسح المطعم والمنيو كله بالصور، وحساب صاحب المطعم كمان. مينفعش ترجع في ده.',
      confirmText: 'مسح المطعم',
    });
    if (!ok) return;
    setDeletingId(r.id);
    await remove.run(r);
    setDeletingId(null);
  };

  const addButton = <Button to="/restaurants/new" icon={Plus}>إضافة مطعم</Button>;

  return (
    <>
      <PageHeader title="المطاعم" description="كل المطاعم والكافيهات اللي على Nakra." actions={addButton} />
      <AsyncContent query={query}>
        {({ restaurants }) => {
          if (!restaurants.length) {
            return <EmptyState icon={Store} title="لسه مفيش مطاعم" description="ضيف أول مطعم وابدأ تعمله المنيو." action={addButton} />;
          }
          const q = search.trim().toLowerCase();
          const visible = q ? restaurants.filter((r) => matches(r, q)) : restaurants;
          return (
            <div className="space-y-5">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input aria-label="بحث" placeholder="دوّر بالاسم أو الإيميل أو الموبايل" className="[&_input]:ps-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {visible.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} onDelete={onDelete} deleting={deletingId === r.id} />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">مفيش نتايج لـ "{search}"</p>
              )}
            </div>
          );
        }}
      </AsyncContent>
    </>
  );
}
