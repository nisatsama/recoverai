const express = require("express");
const router = express.Router();

const {
  getAuditLogs,
  getTransactionAuditLogs,
} = require("../controllers/auditController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getAuditLogs);

router.get(
  "/transactions/:transactionId",
  authMiddleware,
  getTransactionAuditLogs,
);

module.exports = router;
