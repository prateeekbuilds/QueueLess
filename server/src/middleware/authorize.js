import AppError from '../utils/AppError.js';

/**
 * Role-based authorization middleware.
 * @param  {...string} roles - Allowed roles (CUSTOMER, STAFF, BUSINESS_ADMIN, PLATFORM_ADMIN)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    // PLATFORM_ADMIN always has full access
    if (req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(`Role '${req.user.role}' is not authorized to perform this action`)
      );
    }

    next();
  };
};

export default authorize;

