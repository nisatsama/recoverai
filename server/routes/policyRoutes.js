const express = require("express");

const {
  evaluatePolicy,
  getPolicyDecision,
  getPolicyDecisions,
} = require("../controllers/policy.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/transactions/:transactionId/evaluate",
  authMiddleware,
  evaluatePolicy,
);

router.get("/transactions/:transactionId", authMiddleware, getPolicyDecision);

router.get("/", authMiddleware, getPolicyDecisions);

module.exports = router;
