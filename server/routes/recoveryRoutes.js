const express = require("express");

const router = express.Router();

const {
  createRecoveryAttempt,
  executeRecovery,
  getRecoveryAttempts,
  getRecoveryAttemptById,
  getRecoveryAttemptByTransaction,
} = require("../controllers/recoveryController");

//const { protect } = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Recovery Routes
|--------------------------------------------------------------------------
*/

// Create a recovery attempt
router.post("/transactions/:transactionId", protect, createRecoveryAttempt);

// Execute a recovery attempt
router.post("/:recoveryAttemptId/execute", protect, executeRecovery);

// Get all recovery attempts
router.get("/", protect, getRecoveryAttempts);

// Get recovery history for a transaction
router.get(
  "/transactions/:transactionId",
  protect,
  getRecoveryAttemptByTransaction,
);

// Get one recovery attempt
router.get("/:recoveryAttemptId", protect, getRecoveryAttemptById);

module.exports = router;
