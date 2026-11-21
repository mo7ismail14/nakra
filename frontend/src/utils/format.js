const priceFormat = new Intl.NumberFormat('ar-EG-u-nu-latn', {
  style: 'currency',
  currency: 'EGP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const dateFormat = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' });

export const formatPrice = (value) => priceFormat.format(Number(value) || 0);
export const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : '');
export const formatDateTime = (iso) => (iso ? dateTimeFormat.format(new Date(iso)) : '');
