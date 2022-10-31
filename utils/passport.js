import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import UserSchema from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRETE,
      callbackURL: "http://localhost:8000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const { name, picture, email, email_verified } = profile._json;
      const username = email.split("@")[0];
      const user = await UserSchema.findOne({ googleId: profile.id });

      if (user)
        return done(null, false, {
          success: false,
          message: "User already exist",
        });

      user = await new UserSchema({
        email,
        name,
        picture,
        confirmedEmail: email_verified,
        username,
        fromGoogle: true,
        googleId: profile.id,
      }).save();

      done(null, user);
    }
  )
);
