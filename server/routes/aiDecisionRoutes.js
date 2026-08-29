const express = require("express");
const router = express.Router();

const {
  createAIDecision,
  getAIDecision,
  getAIDecisions,
} = require("../controllers/aiDecisionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/transactions/:transactionId/analyze",
  authMiddleware,
  createAIDecision,
);

router.get("/transactions/:transactionId", authMiddleware, getAIDecision);

router.get("/decisions", authMiddleware, getAIDecisions);

module.exports = router;
