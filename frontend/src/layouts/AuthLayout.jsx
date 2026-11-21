import { Outlet } from 'react-router-dom';
import Brand from '../components/ui/Brand.jsx';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-10">
      <Brand className="mb-8 text-2xl" />
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Outlet />
      </div>
      <p className="mt-8 text-xs text-slate-400">© {new Date().getFullYear()} Nakra</p>
    </div>
  );
}

/** Title + subtitle used at the top of every auth page. */
export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm leading-6 text-slate-500">{subtitle}</p>}
    </div>
  );
}
