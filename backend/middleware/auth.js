const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — JWT auth middleware
 * Attaches req.user from a valid Bearer token.
 * Usage: router.get('/profile', protect, handler)
 */
const protect = async (req, res, next) => {
    try {
        // 1. Extract token from Authorization header
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorised — no token provided'
            });
        }

        const token = auth.split(' ')[1];

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch user (exclude password)
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Not authorised — user not found or inactive'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError'
            ? 'Token expired — please log in again'
            : 'Not authorised — invalid token';
        return res.status(401).json({ success: false, error: message });
    }
};

/**
 * requireRole — restrict to specific roles
 * Usage: router.delete('/user/:id', protect, requireRole('admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({
            success: false,
            error: `Access denied — requires role: ${roles.join(' or ')}`
        });
    }
    next();
};

module.exports = { protect, requireRole };
