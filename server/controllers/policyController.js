const { PrismaClient } = require("@prisma/client");
const {
  evaluatePolicy,
  createPolicyDecision,
} = require("../services/policyService");

const prisma = new PrismaClient();

/**
 * POST /api/policy/transactions/:transactionId/evaluate
 *
 * Evaluate whether a recovery action is allowed for a transaction.
 */
const evaluatePolicyController = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { requestedAction } = req.body;

    if (!requestedAction) {
      return res.status(400).json({
        message: "requestedAction is required",
      });
    }

    const validActions = [
      "RETRY",
      "NOTIFY_CUSTOMER",
      "REQUEST_NEW_PAYMENT_METHOD",
      "SKIP",
    ];

    if (!validActions.includes(requestedAction)) {
      return res.status(400).json({
        message: "Invalid requestedAction",
        allowedActions: validActions,
      });
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        aiDecision: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // If your auth middleware attaches merchantId to req.user
    if (
      req.user?.merchantId &&
      transaction.merchantId !== req.user.merchantId
    ) {
      return res.status(403).json({
        message: "You are not authorized to access this transaction",
      });
    }

    const result = await evaluatePolicy(transaction, requestedAction);

    const decision = await createPolicyDecision({
      transactionId,
      requestedAction: result.requestedAction,
      allowed: result.allowed,
      reason: result.reason,
    });

    return res.status(201).json({
      id: decision.id,
      requestedAction: decision.requestedAction,
      allowed: decision.allowed,
      reason: decision.reason,
      createdAt: decision.createdAt,
    });
  } catch (error) {
    console.error("Policy evaluation error:", error);

    return res.status(500).json({
      message: "Failed to evaluate policy",
      error: error.message,
    });
  }
};

/**
 * GET /api/policy/transactions/:transactionId
 *
 * Get the latest policy decision for a transaction.
 */
const getPolicyDecision = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    if (
      req.user?.merchantId &&
      transaction.merchantId !== req.user.merchantId
    ) {
      return res.status(403).json({
        message: "You are not authorized to access this transaction",
      });
    }

    const decision = await prisma.policyDecision.findFirst({
      where: {
        transactionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!decision) {
      return res.status(404).json({
        message: "No policy decision found for this transaction",
      });
    }

    return res.status(200).json(decision);
  } catch (error) {
    console.error("Get policy decision error:", error);

    return res.status(500).json({
      message: "Failed to fetch policy decision",
      error: error.message,
    });
  }
};

/**
 * GET /api/policy
 *
 * Get policy decisions for the authenticated merchant.
 */
const getPolicyDecisions = async (req, res) => {
  try {
    const where = {};

    // Recommended: restrict decisions to the authenticated merchant.
    if (req.user?.merchantId) {
      where.transaction = {
        merchantId: req.user.merchantId,
      };
    }

    const decisions = await prisma.policyDecision.findMany({
      where,
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            currency: true,
            paymentMethod: true,
            status: true,
            customerEmail: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: decisions.length,
      decisions,
    });
  } catch (error) {
    console.error("Get policy decisions error:", error);

    return res.status(500).json({
      message: "Failed to fetch policy decisions",
      error: error.message,
    });
  }
};

module.exports = {
  evaluatePolicy: evaluatePolicyController,
  getPolicyDecision,
  getPolicyDecisions,
};
