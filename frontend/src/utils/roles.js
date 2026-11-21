export const ROLES = { SUPERADMIN: 'superadmin', ADMIN: 'admin', OWNER: 'owner' };
export const STAFF = [ROLES.SUPERADMIN, ROLES.ADMIN];

export const ROLE_LABELS = {
  superadmin: 'مسؤول رئيسي',
  admin: 'مسؤول',
  owner: 'صاحب مطعم',
};

export const isStaff = (user) => STAFF.includes(user?.role);

/** Where each role lands after login. */
export const homePath = (user) => (user?.role === ROLES.OWNER ? `/restaurants/${user.restaurantId}` : '/restaurants');
