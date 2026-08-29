const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const prisma = require("./prisma");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase();

        const name =
          profile.displayName ||
          `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();

        if (!email) {
          return done(null, false);
        }

        // 1. Check if Google account is already linked
        let merchant = await prisma.merchant.findUnique({
          where: {
            googleId,
          },
        });

        if (merchant) {
          return done(null, merchant);
        }

        // 2. Check if merchant already exists with this email
        merchant = await prisma.merchant.findUnique({
          where: {
            email,
          },
        });

        if (merchant) {
          // Link Google account to existing merchant
          merchant = await prisma.merchant.update({
            where: {
              id: merchant.id,
            },
            data: {
              googleId,
              authProvider: "google",
            },
          });

          return done(null, merchant);
        }

        // 3. Create new merchant
        merchant = await prisma.merchant.create({
          data: {
            name: name || "Google Merchant",
            email,
            googleId,
            authProvider: "google",
            password: null,
          },
        });

        return done(null, merchant);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    },
  ),
);

module.exports = passport;
