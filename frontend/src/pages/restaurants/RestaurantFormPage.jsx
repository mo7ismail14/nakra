import { useNavigate } from 'react-router-dom';
import RestaurantForm from '../../components/restaurants/RestaurantForm.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

export default function RestaurantFormPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="إضافة مطعم" description="بعد الحفظ هتقدر تضيف المنيو وتبعت دعوة لصاحب المطعم." backTo="/restaurants" backLabel="كل المطاعم" />
      <RestaurantForm onSaved={(r) => navigate(`/restaurants/${r.id}?tab=menu`, { replace: true })} />
    </div>
  );
}
