import { useParams } from 'react-router-dom';
import { invitationsApi } from '../../api/endpoints.js';
import SetPasswordPage from '../../components/auth/SetPasswordPage.jsx';

export default function AcceptInvitation() {
  const { token } = useParams();
  return (
    <SetPasswordPage
      loadInfo={() => invitationsApi.info(token)}
      title={(info) => `أهلاً بيك في ${info.restaurantName}`}
      subtitle={() => 'اعمل كلمة مرور لحسابك، وبعدها تقدر تدير المنيو والأسعار ووسائل الدفع.'}
      submit={(password) => invitationsApi.accept(token, password)}
      submitLabel="إنشاء الحساب والدخول"
    />
  );
}
