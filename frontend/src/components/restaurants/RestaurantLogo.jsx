import { cn } from '../../utils/helpers.js';

const SIZES = { sm: 'size-10 text-sm', md: 'size-14 text-lg', lg: 'size-16 text-xl', xl: 'size-24 text-3xl' };

/** Logo image, or the first letter of the name when there is no logo. */
export default function RestaurantLogo({ name, logoUrl, size = 'md', className }) {
  const classes = cn('shrink-0 rounded-2xl border border-slate-200 bg-white object-cover', SIZES[size], className);
  if (logoUrl) return <img src={logoUrl} alt={name} className={classes} />;
  return (
    <span className={cn(classes, 'flex items-center justify-center bg-brand-50 font-bold text-brand-700')} aria-hidden="true">
      {name?.trim()?.[0] ?? '?'}
    </span>
  );
}
