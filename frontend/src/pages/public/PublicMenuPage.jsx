import { SearchX, Wallet } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../../api/endpoints.js';
import MenuItemCard from '../../components/public/MenuItemCard.jsx';
import PaymentOptions from '../../components/public/PaymentOptions.jsx';
import RestaurantLogo from '../../components/restaurants/RestaurantLogo.jsx';
import Brand from '../../components/ui/Brand.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { PageLoader } from '../../components/ui/Spinner.jsx';
import { useApi } from '../../hooks/useApi.js';

/** What the customer sees after scanning the menu QR code (mobile first). */
export default function PublicMenuPage() {
  const { slug } = useParams();
  const query = useApi(() => publicApi.menu(slug), [slug]);
  const menu = query.data?.menu;

  useEffect(() => {
    if (menu) document.title = `${menu.name} | المنيو`;
  }, [menu]);

  if (query.loading) return <PageLoader />;
  if (query.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState icon={SearchX} title="المنيو ده مش موجود" description="اتأكد من الرابط أو امسح الـ QR تاني." className="w-full max-w-md" />
      </div>
    );
  }

  const hasPayments = Object.values(menu.payments || {}).some(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-b from-brand-700 to-brand-800 px-4 pb-10 pt-8 text-center text-white">
        <RestaurantLogo name={menu.name} logoUrl={menu.logoUrl} size="xl" className="mx-auto border-4 border-white/20 shadow-lg" />
        <h1 className="mt-4 text-2xl font-bold">{menu.name}</h1>
      </header>

      {/* Category chips: sticky, scroll to section */}
      {menu.categories.length > 0 && (
        <nav className="sticky top-0 z-10 -mt-5 overflow-x-auto px-4">
          <div className="mx-auto flex w-max max-w-full gap-2 rounded-full bg-white p-1.5 shadow-md">
            {menu.categories.map((c) => (
              <a key={c.id} href={`#c-${c.id}`} className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800">
                {c.name}
              </a>
            ))}
            {hasPayments && (
              <a href="#payment" className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-700 px-4 py-1.5 text-sm font-medium text-white">
                <Wallet className="size-4" />
                الدفع
              </a>
            )}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        {menu.categories.length ? (
          menu.categories.map((c) => (
            <section key={c.id} id={`c-${c.id}`} className="scroll-mt-20 space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{c.name}</h2>
              {c.items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </section>
          ))
        ) : (
          <EmptyState title="المنيو هيتضاف قريب" />
        )}
        <PaymentOptions payments={menu.payments} />
      </main>

      <footer className="flex justify-center pb-8 opacity-60">
        <Brand className="text-sm [&_svg]:size-3.5" />
      </footer>
    </div>
  );
}
