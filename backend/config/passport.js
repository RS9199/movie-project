const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const name = profile.displayName;

            let user = await User.findOne({ email });

            if (user) {
                return done(null, user);
            }

            user = await User.create({
                name: name,
                email: email,
                password: 'google-oauth-' + profile.id + '-' + Date.now(),
                isVerified: true
            });

            done(null, user);

        } catch (error) {
            done(error, null);
        }
    }
));

module.exports = passport;