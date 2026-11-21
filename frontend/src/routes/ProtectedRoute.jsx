import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { homePath } from '../utils/roles.js';

/** Logged-in users only (optionally only some roles). */
export function RequireAuth({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user)} replace />;
  return children ?? <Outlet />;
}

/** Login / forgot password: logged-in users go to their home page. */
export function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <PageLoader />;
  if (user) return <Navigate to={homePath(user)} replace />;
  return children ?? <Outlet />;
}

export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePath(user)} replace />;
}
