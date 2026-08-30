const prisma = require("../config/prisma");
const { evaluatePolicy } = require("../services/policyService");
const { simulatePayment } = require("../services/paymentSimulator");
const RecoveryAction = {
  RETRY: "RETRY",
  SEND_REMINDER: "SEND_REMINDER",
  UPDATE_PAYMENT_METHOD: "UPDATE_PAYMENT_METHOD",
  ESCALATE: "ESCALATE",
  NO_ACTION: "NO_ACTION",
};

const RecoveryStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  BLOCKED: "BLOCKED",
  SKIPPED: "SKIPPED",
};

const AuditActor = {
  AI: "AI",
  POLICY_ENGINE: "POLICY_ENGINE",
  SYSTEM: "SYSTEM",
  MERCHANT: "MERCHANT",
};

const createRecoveryAttempt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        merchantId,
      },
      include: {
        aiDecision: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    if (transaction.status !== "FAILED") {
      return res.status(400).json({
        success: false,
        message: "Recovery can only be initiated for failed transactions.",
      });
    }

    if (!transaction.aiDecision) {
      return res.status(400).json({
        success: false,
        message:
          "No AI decision exists for this transaction. Analyze the transaction before starting recovery.",
      });
    }

    const aiRecommendedAction = transaction.aiDecision.recommendedAction;
    const action = aiRecommendedAction;
    const policy = await evaluatePolicy(transaction, action);

    const policyDecision = await prisma.policyDecision.create({
      data: {
        transactionId: transaction.id,
        requestedAction: action,
        allowed: policy.allowed,
        reason: policy.reason,
      },
    });
    await prisma.auditLog.create({
      data: {
        transactionId: transaction.id,
        event: policy.allowed
          ? "RECOVERY_POLICY_ALLOWED"
          : "RECOVERY_POLICY_BLOCKED",
        actor: AuditActor.POLICY_ENGINE,
        metadata: {
          requestedAction: action,
          aiRecommendedAction,
          policyDecisionId: policyDecision.id,
          reason: policy.reason,
        },
      },
    });

    if (!policy.allowed) {
      const blockedAttempt = await prisma.recoveryAttempt.create({
        data: {
          transactionId: transaction.id,
          action,
          status: RecoveryStatus.BLOCKED,
          failureReason: policy.reason,
        },
      });

      await prisma.auditLog.create({
        data: {
          transactionId: transaction.id,
          event: "RECOVERY_BLOCKED",
          actor: AuditActor.SYSTEM,
          metadata: {
            recoveryAttemptId: blockedAttempt.id,
            action,
            reason: policy.reason,
          },
        },
      });

      return res.status(403).json({
        success: false,
        message: "Recovery action blocked by policy.",
        recoveryAttempt: blockedAttempt,
        policyDecision,
      });
    }
    const recoveryAttempt = await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action,
        status:
          action === RecoveryAction.NO_ACTION
            ? RecoveryStatus.SKIPPED
            : RecoveryStatus.PENDING,

        executedAt: action === RecoveryAction.NO_ACTION ? new Date() : null,
      },
    });
    await prisma.auditLog.create({
      data: {
        transactionId: transaction.id,
        event:
          action === RecoveryAction.SKIP
            ? "RECOVERY_SKIPPED"
            : "RECOVERY_ATTEMPT_CREATED",
        actor: AuditActor.SYSTEM,
        metadata: {
          recoveryAttemptId: recoveryAttempt.id,
          action,
          aiRecommendedAction,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message:
        action === RecoveryAction.NO_ACTION
          ? "No recovery action required."
          : "Recovery attempt created successfully.",
      recoveryAttempt,
      policyDecision,
      aiDecision: transaction.aiDecision,
    });
  } catch (error) {
    console.error("createRecoveryAttempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create recovery attempt.",
      error: error.message,
    });
  }
};

const executeRecovery = async (req, res) => {
  try {
    const { recoveryAttemptId } = req.params;
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }
    const recoveryAttempt = await prisma.recoveryAttempt.findFirst({
      where: {
        id: recoveryAttemptId,
        transaction: {
          merchantId,
        },
      },
      include: {
        transaction: {
          include: {
            aiDecision: true,
          },
        },
      },
    });

    if (!recoveryAttempt) {
      return res.status(404).json({
        success: false,
        message: "Recovery attempt not found.",
      });
    }
    if (recoveryAttempt.status !== RecoveryStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Recovery attempt cannot be executed because its current status is ${recoveryAttempt.status}.`,
      });
    }

    const transaction = recoveryAttempt.transaction;
    const policy = await evaluatePolicy(transaction, recoveryAttempt.action);
    if (!policy.allowed) {
      const blockedAttempt = await prisma.recoveryAttempt.update({
        where: {
          id: recoveryAttempt.id,
        },
        data: {
          status: RecoveryStatus.BLOCKED,
          failureReason: policy.reason,
        },
      });

      await prisma.auditLog.create({
        data: {
          transactionId: transaction.id,
          event: "RECOVERY_EXECUTION_BLOCKED",
          actor: AuditActor.POLICY_ENGINE,
          metadata: {
            recoveryAttemptId: recoveryAttempt.id,
            action: recoveryAttempt.action,
            reason: policy.reason,
          },
        },
      });

      return res.status(403).json({
        success: false,
        message: "Recovery execution blocked by policy.",
        recoveryAttempt: blockedAttempt,
      });
    }
    let executionStatus = RecoveryStatus.SUCCESS;
    let amountRecovered = null;
    let failureReason = null;

    switch (recoveryAttempt.action) {
      case RecoveryAction.RETRY: {
        const paymentResult = simulatePayment(transaction);

        if (paymentResult.status === "SUCCESS") {
          executionStatus = RecoveryStatus.SUCCESS;
          amountRecovered = transaction.amount;
        } else {
          executionStatus = RecoveryStatus.FAILED;
          failureReason =
            paymentResult.message || "Payment recovery attempt failed";
        }

        break;
      }

      case RecoveryAction.SEND_REMINDER:
        executionStatus = RecoveryStatus.SUCCESS;
        amountRecovered = null;
        break;

      case RecoveryAction.UPDATE_PAYMENT_METHOD:
        executionStatus = RecoveryStatus.SUCCESS;
        amountRecovered = null;
        break;

      case RecoveryAction.NO_ACTION:
        executionStatus = RecoveryStatus.SKIPPED;
        break;
      case RecoveryAction.ESCALATE:
        executionStatus = RecoveryStatus.SKIPPED;
        amountRecovered = null;
        failureReason = "Transaction escalated for manual review.";
        break;
      default:
        executionStatus = RecoveryStatus.FAILED;
        failureReason = "Unsupported recovery action.";
    }
    if (recoveryAttempt.action === RecoveryAction.RETRY) {
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          ...(executionStatus === RecoveryStatus.SUCCESS
            ? { status: "SUCCESS" }
            : {}),
          retryCount: {
            increment: 1,
          },
        },
      });
    }
    const updatedAttempt = await prisma.recoveryAttempt.update({
      where: {
        id: recoveryAttempt.id,
      },
      data: {
        status: executionStatus,
        amountRecovered,
        executedAt: new Date(),
        failureReason,
      },
    });

    await prisma.auditLog.create({
      data: {
        transactionId: transaction.id,
        event:
          executionStatus === RecoveryStatus.SUCCESS
            ? "RECOVERY_EXECUTED"
            : "RECOVERY_EXECUTION_FAILED",
        actor: AuditActor.SYSTEM,
        metadata: {
          recoveryAttemptId: recoveryAttempt.id,
          action: recoveryAttempt.action,
          status: executionStatus,
          amountRecovered: amountRecovered ? amountRecovered.toString() : null,
          failureReason,
        },
      },
    });

    return res.status(200).json({
      success: executionStatus === RecoveryStatus.SUCCESS,
      message:
        executionStatus === RecoveryStatus.SUCCESS
          ? "Recovery executed successfully."
          : "Recovery execution failed.",
      recoveryAttempt: updatedAttempt,
    });
  } catch (error) {
    console.error("executeRecovery error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to execute recovery.",
      error: error.message,
    });
  }
};
const getRecoveryAttempts = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const recoveryAttempts = await prisma.recoveryAttempt.findMany({
      where: {
        transaction: {
          merchantId,
        },
      },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            currency: true,
            paymentMethod: true,
            status: true,
            failureReason: true,
            customerEmail: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        executedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: recoveryAttempts.length,
      recoveryAttempts,
    });
  } catch (error) {
    console.error("getRecoveryAttempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recovery attempts.",
      error: error.message,
    });
  }
};
const getRecoveryAttemptByTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        merchantId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    const recoveryAttempts = await prisma.recoveryAttempt.findMany({
      where: {
        transactionId,
      },
      orderBy: {
        executedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      transactionId,
      count: recoveryAttempts.length,
      recoveryAttempts,
    });
  } catch (error) {
    console.error("getRecoveryAttemptByTransaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction recovery history.",
      error: error.message,
    });
  }
};
const getRecoveryAttemptById = async (req, res) => {
  try {
    const { recoveryAttemptId } = req.params;
    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const recoveryAttempt = await prisma.recoveryAttempt.findFirst({
      where: {
        id: recoveryAttemptId,
        transaction: {
          merchantId,
        },
      },
      include: {
        transaction: {
          include: {
            aiDecision: true,
          },
        },
      },
    });

    if (!recoveryAttempt) {
      return res.status(404).json({
        success: false,
        message: "Recovery attempt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      recoveryAttempt,
    });
  } catch (error) {
    console.error("getRecoveryAttemptById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recovery attempt.",
      error: error.message,
    });
  }
};

module.exports = {
  createRecoveryAttempt,
  executeRecovery,
  getRecoveryAttempts,
  getRecoveryAttemptById,
  getRecoveryAttemptByTransaction,
};
