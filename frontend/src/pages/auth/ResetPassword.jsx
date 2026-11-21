import { useParams } from 'react-router-dom';
import { authApi } from '../../api/endpoints.js';
import SetPasswordPage from '../../components/auth/SetPasswordPage.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  return (
    <SetPasswordPage
      loadInfo={() => authApi.resetInfo(token)}
      title={() => 'تعيين كلمة المرور'}
      subtitle={() => 'اختار كلمة مرور جديدة لحسابك.'}
      submit={(password) => authApi.resetPassword(token, password)}
      submitLabel="حفظ والدخول"
    />
  );
}
