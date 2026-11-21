import { ExternalLink, LayoutList, QrCode, Settings, Trash2, UserPlus } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { restaurantsApi } from '../../api/endpoints.js';
import MenuEditor from '../../components/menu/MenuEditor.jsx';
import InvitationPanel from '../../components/restaurants/InvitationPanel.jsx';
import QrCodesPanel from '../../components/restaurants/QrCodesPanel.jsx';
import RestaurantForm from '../../components/restaurants/RestaurantForm.jsx';
import RestaurantLogo from '../../components/restaurants/RestaurantLogo.jsx';
import AsyncContent from '../../components/ui/AsyncContent.jsx';
import Button from '../../components/ui/Button.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { isStaff } from '../../utils/roles.js';

const TABS = [
  { id: 'menu', label: 'المنيو', icon: LayoutList },
  { id: 'info', label: 'البيانات والدفع', icon: Settings },
  { id: 'qr', label: 'الرابط و QR', icon: QrCode },
  { id: 'owner', label: 'صاحب المطعم', icon: UserPlus, staffOnly: true },
];

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const staff = isStaff(user);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();

  const query = useApi(() => restaurantsApi.get(id), [id]);
  const tabs = TABS.filter((t) => staff || !t.staffOnly);
  const tab = tabs.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'menu';
  const setTab = (next) => setParams({ tab: next }, { replace: true });

  const setRestaurant = (updater) => query.setData((d) => ({ restaurant: updater(d.restaurant) }));
  const setCategories = (updater) =>
    setRestaurant((r) => ({ ...r, categories: typeof updater === 'function' ? updater(r.categories) : updater }));

  const remove = useAction(() => restaurantsApi.remove(id), {
    successMessage: 'تم مسح المطعم',
    onSuccess: () => navigate('/restaurants', { replace: true }),
  });

  return (
    <AsyncContent query={query}>
      {({ restaurant }) => {
        const onDelete = async () => {
          const ok = await confirm({
            title: `مسح "${restaurant.name}"؟`,
            message: 'هيتمسح المطعم والمنيو كله بالصور، وحساب صاحب المطعم كمان. مينفعش ترجع في ده.',
            confirmText: 'مسح المطعم',
          });
          if (ok) remove.run();
        };

        return (
          <>
            <PageHeader
              backTo={staff ? '/restaurants' : undefined}
              backLabel="كل المطاعم"
              media={<RestaurantLogo name={restaurant.name} logoUrl={restaurant.logoUrl} size="lg" />}
              title={restaurant.name}
              description={`صاحب المطعم: ${restaurant.ownerName}`}
              actions={
                <>
                  <Button variant="secondary" icon={ExternalLink} href={restaurant.menuUrl}>
                    عرض المنيو
                  </Button>
                  {staff && (
                    <Button variant="danger-ghost" icon={Trash2} onClick={onDelete} loading={remove.running}>
                      مسح المطعم
                    </Button>
                  )}
                </>
              }
            />
            <Tabs tabs={tabs} value={tab} onChange={setTab} />

            {tab === 'menu' && <MenuEditor restaurantId={restaurant.id} categories={restaurant.categories} setCategories={setCategories} />}
            {tab === 'info' && (
              <div className="max-w-3xl">
                <RestaurantForm restaurant={restaurant} onSaved={(saved) => setRestaurant(() => saved)} />
              </div>
            )}
            {tab === 'qr' && <QrCodesPanel restaurant={restaurant} onEditPayments={() => setTab('info')} />}
            {tab === 'owner' && <InvitationPanel restaurant={restaurant} onChanged={query.reload} />}
          </>
        );
      }}
    </AsyncContent>
  );
}
