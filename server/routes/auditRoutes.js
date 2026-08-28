const express = require("express");
const router = express.Router();

const {
  getAuditLogs,
  getTransactionAuditLogs,
} = require("../controllers/audit.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, getAuditLogs);

router.get(
  "/transactions/:transactionId",
  authMiddleware,
  getTransactionAuditLogs,
);

module.exports = router;
