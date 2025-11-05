/**
 * Authentication middleware using sessions
 * Checks if user is logged in via session
 */
const authenticateSession = (req, res, next) => {
    // Check if session exists and has user data
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please login to continue.'
        });
    }

    // Attach user info to request object
    req.user = req.session.user;

    next();
};

/**
 * Optional authentication middleware
 * Attaches user info if session exists, but doesn't block request
 */
const optionalAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        req.user = req.session.user;
    } else {
        req.user = null;
    }

    next();
};

/**
 * Middleware to check if user owns the resource
 * Use after authenticateSession
 */
const checkOwnership = (resourceType) => {
    return (req, res, next) => {
        // This middleware should be used with routes that have resource ownership
        // Example: Only recipe creator can update/delete their recipe

        // The controller should check if req.user.user_id matches the resource owner
        // This is just a placeholder - actual implementation in controllers
        next();
    };
};

module.exports = {
    authenticateSession,
    authenticateToken: authenticateSession, // Alias for backward compatibility
    optionalAuth,
    checkOwnership
};
