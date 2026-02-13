/**
 * Role-Based Authorization Middleware
 * Checks if authenticated user has required role(s)
 * Must be used AFTER authenticate middleware
 */

/**
 * Authorize specific roles
 * @param  {...string} allowedRoles - Roles that can access this route
 * @returns Express middleware function
 *
 * Usage:
 *   router.get('/admin/dashboard', authenticate, authorize('admin'), handler);
 *   router.get('/tenant/dashboard', authenticate, authorize('tenant', 'admin'), handler);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        details: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Authorize tenant-only access
 * Shorthand for authorize('tenant')
 */
const authorizeTenant = authorize('tenant');

/**
 * Authorize admin-only access
 * Shorthand for authorize('admin')
 */
const authorizeAdmin = authorize('admin');

/**
 * Authorize property manager or admin
 * Common use case for property management features
 */
const authorizePropertyManager = authorize('property_manager', 'admin');

/**
 * Authorize resource owner
 * Checks if the authenticated user owns the resource
 * @param {string} resourceIdParam - Request parameter name containing resource user ID
 * @param {string} resourceType - Type of resource (for error messages)
 */
const authorizeOwner = (resourceIdParam = 'userId', resourceType = 'resource') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceOwnerId = parseInt(req.params[resourceIdParam] || req.body[resourceIdParam]);

    // Admins can access any resource
    if (req.userRole === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req.userId !== resourceOwnerId) {
      return res.status(403).json({
        success: false,
        error: `You do not have permission to access this ${resourceType}`
      });
    }

    next();
  };
};

/**
 * Authorize admin or resource owner
 * Allows both admins and the resource owner to access
 * @param {string} resourceIdParam - Request parameter name containing resource user ID
 */
const authorizeAdminOrOwner = (resourceIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceOwnerId = parseInt(req.params[resourceIdParam] || req.body[resourceIdParam]);

    // Allow if admin OR owner
    if (req.userRole === 'admin' || req.userId === resourceOwnerId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });
  };
};

module.exports = {
  authorize,
  authorizeTenant,
  authorizeAdmin,
  authorizePropertyManager,
  authorizeOwner,
  authorizeAdminOrOwner
};
