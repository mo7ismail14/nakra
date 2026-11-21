import { forbidden } from '../utils/httpError.js';

export const STAFF = ['superadmin', 'admin'];

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user?.role)) throw forbidden();
    next();
  };

/** Staff can reach every restaurant; an owner only the one he belongs to. */
export const requireRestaurantAccess =
  (param = 'id') =>
  (req, _res, next) => {
    const { role, restaurantId } = req.user;
    if (STAFF.includes(role)) return next();
    if (role === 'owner' && restaurantId === req.params[param]) return next();
    throw forbidden();
  };
