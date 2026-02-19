const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authMiddleware, authController.getMe);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

module.exports = router;