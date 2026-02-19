const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                error: 'Not authorized. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                error: 'User no longer exists'
            });
        }

        req.user = {
            id: user._id,
            role: user.role
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired. Please login again.'
            });
        }

        next(error);
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin access only'
        });
    }

    next();
};

module.exports = { authMiddleware, adminOnly };