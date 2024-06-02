//google auth
import passport from "passport";
import { userModel } from "~/models/userModel";
var GoogleStrategy = require("passport-google-oauth20").Strategy;
import { env } from "./environment";
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_AUTH_ID,
      clientSecret: env.GOOGLE_AUTH_SECRET,
      //call auth/google thành công thì nhảy sang route này
      callbackURL: "http://localhost:8080/v1/auth/google/callback",
    },
    userModel.findOrCreate
  )
);

//lưu user vào cookie
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
