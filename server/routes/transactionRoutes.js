const express = require("express");

const router = express.Router();

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  createTransactionSchema,
} = require("../validators/transactionValidator");

router.post(
  "/",
  authMiddleware,
  validate(createTransactionSchema),
  createTransaction,
);

router.get("/", authMiddleware, getTransactions);

router.get("/:id", authMiddleware, getTransactionById);

router.patch("/:id/status", authMiddleware, updateTransactionStatus);

router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
