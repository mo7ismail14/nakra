import { LogOut, Menu, Store, Users, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Brand from '../components/ui/Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../utils/helpers.js';
import { ROLE_LABELS, ROLES, isStaff } from '../utils/roles.js';

function navItems(user) {
  if (user.role === ROLES.OWNER) return [{ to: `/restaurants/${user.restaurantId}`, label: 'مطعمي', icon: Store }];
  return [
    { to: '/restaurants', label: 'المطاعم', icon: Store },
    ...(user.role === ROLES.SUPERADMIN ? [{ to: '/admins', label: 'المسؤولين', icon: Users }] : []),
  ];
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems(user).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={!isStaff(user)}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p dir="ltr" className="truncate text-end text-sm font-medium text-slate-800" title={user.email}>
          {user.email}
        </p>
        <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-e border-slate-200 bg-white lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Brand className="text-lg" />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="القائمة">
          <Menu className="size-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute end-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="إغلاق">
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
