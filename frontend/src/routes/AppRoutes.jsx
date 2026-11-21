import { Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AdminsPage from '../pages/admins/AdminsPage.jsx';
import AcceptInvitation from '../pages/auth/AcceptInvitation.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import Login from '../pages/auth/Login.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import NotFound from '../pages/NotFound.jsx';
import PublicMenuPage from '../pages/public/PublicMenuPage.jsx';
import RestaurantDetailsPage from '../pages/restaurants/RestaurantDetailsPage.jsx';
import RestaurantFormPage from '../pages/restaurants/RestaurantFormPage.jsx';
import RestaurantsPage from '../pages/restaurants/RestaurantsPage.jsx';
import { ROLES, STAFF } from '../utils/roles.js';
import { GuestOnly, HomeRedirect, RequireAuth } from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route element={<GuestOnly />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="invite/:token" element={<AcceptInvitation />} />
      </Route>

      {/* Customer menu (public, from the QR code) */}
      <Route path="m/:slug" element={<PublicMenuPage />} />

      {/* Dashboard */}
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="restaurants" element={<RequireAuth roles={STAFF}><RestaurantsPage /></RequireAuth>} />
          <Route path="restaurants/new" element={<RequireAuth roles={STAFF}><RestaurantFormPage /></RequireAuth>} />
          <Route path="restaurants/:id" element={<RestaurantDetailsPage />} />
          <Route path="admins" element={<RequireAuth roles={[ROLES.SUPERADMIN]}><AdminsPage /></RequireAuth>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
