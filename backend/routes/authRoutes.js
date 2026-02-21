const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', auth, authController.getMe);

router.get('/verify-email/:token', authController.verifyEmail);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

module.exports = router;