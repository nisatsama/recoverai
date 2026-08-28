const express = require("express");

const {
  registerMerchant,
  loginMerchant,
  getCurrentMerchant,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register merchant
 */
router.post("/register", registerMerchant);

/**
 * POST /api/auth/login
 * Login merchant
 */
router.post("/login", loginMerchant);

/**
 * GET /api/auth/me
 * Get authenticated merchant
 */
router.get("/me", authMiddleware, getCurrentMerchant);

module.exports = router;
