const prisma = require("../config/prisma");

/**
 * CREATE TRANSACTION
 * POST /api/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const {
      amount,
      currency,
      paymentMethod,
      status,
      failureReason,
      customerEmail,
    } = req.body;

    // Basic validation
    if (!amount || !paymentMethod || !status || !customerEmail) {
      return res.status(400).json({
        message: "amount, paymentMethod, status and customerEmail are required",
      });
    }

    // Validate payment method
    const validPaymentMethods = [
      "UPI",
      "CARD",
      "NET_BANKING",
      "WALLET",
      "BANK_TRANSFER",
    ];

    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Validate transaction status
    const validStatuses = ["PENDING", "SUCCESS", "FAILED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid transaction status",
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        merchantId,
        amount,
        currency: currency || "INR",
        paymentMethod,
        status,
        failureReason: failureReason || null,
        customerEmail,
      },
    });

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    return res.status(500).json({
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

/**
 * GET ALL TRANSACTIONS
 * GET /api/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        merchantId,
      },
      include: {
        aiDecision: true,
        recoveryAttempts: true,
        policyDecisions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

/**
 * GET TRANSACTION BY ID
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        merchantId,
      },
      include: {
        aiDecision: true,
        recoveryAttempts: true,
        policyDecisions: true,
        auditLogs: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      transaction,
    });
  } catch (error) {
    console.error("Get transaction by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};

/**
 * UPDATE TRANSACTION STATUS
 * PATCH /api/transactions/:id/status
 */
const updateTransactionStatus = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { id } = req.params;
    const { status, failureReason } = req.body;

    // Validate status
    const validStatuses = ["PENDING", "SUCCESS", "FAILED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid transaction status",
      });
    }

    // Make sure transaction belongs to merchant
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const transaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        status,
        failureReason:
          status === "FAILED"
            ? failureReason || existingTransaction.failureReason
            : null,
      },
    });

    return res.status(200).json({
      message: "Transaction status updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction status error:", error);

    return res.status(500).json({
      message: "Failed to update transaction status",
      error: error.message,
    });
  }
};

/**
 * DELETE TRANSACTION
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { id } = req.params;

    // Make sure transaction belongs to merchant
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!existingTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    return res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
};
