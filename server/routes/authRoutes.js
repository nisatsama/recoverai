const express = require("express");
const passport = require("../config/passport");

const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Local authentication
router.post("/register", register);
router.post("/login", login);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  (req, res) => {
    console.log("Google authentication successful!");
    console.log(req.user);

    res.json({
      message: "Google authentication successful",
      merchant: req.user,
    });
  },
);

// Current authenticated merchant
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", authMiddleware, logout);

module.exports = router;
