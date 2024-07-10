import { ErrorClass } from "../utils/error-class.utils.js";

/**
 * Middleware to check if the user's role is allowed to access the route
 * @param {Array|string} allowedRoles - Array or string of allowed roles
 * @returns {Function} - Middleware function
 */
export const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    // Get the logged-in user from the request
    const user = req.authUser;
    
    // Check if user exists
    if (!user) {
      return next(new ErrorClass("Authentication Error", 401, "User not authenticated", "authorize.user"));
    }

    // Check if the allowed roles include the user's role
    if (Array.isArray(allowedRoles)) {
      if (!allowedRoles.includes(user.role)) {
        return next(new ErrorClass("Authorization Error", 403, "You are not allowed to access this route", "authorize.allowedRoles"));
      }
    } else {
      if (user.role !== allowedRoles) {
        return next(new ErrorClass("Authorization Error", 403, "You are not allowed to access this route", "authorize.allowedRoles"));
      }
    }
    next();
  };
};
