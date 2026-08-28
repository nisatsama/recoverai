const express = require("express");

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

// Current authenticated merchant
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", authMiddleware, logout);

module.exports = router;
