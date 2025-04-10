const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value || "",
                avatar: profile.photos?.[0]?.value || "",
                role: "user"
            });
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, false);
    }
}));

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        return done(null, user || false);
    } catch (error) {
        console.error("JWT Strategy Error:", error);
        return done(error, false);
    }
}));

module.exports = passport;