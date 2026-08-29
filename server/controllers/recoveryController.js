const prisma = require("../config/prisma");

// Prisma 7 + CommonJS
// Keep these values aligned with prisma/schema.prisma

const RecoveryAction = {
  RETRY: "RETRY",
  NOTIFY_CUSTOMER: "NOTIFY_CUSTOMER",
  REQUEST_NEW_PAYMENT_METHOD: "REQUEST_NEW_PAYMENT_METHOD",
  SKIP: "SKIP",
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

/*
|--------------------------------------------------------------------------
| Policy Engine
|--------------------------------------------------------------------------
| This is intentionally kept inside the recovery controller for the MVP.
| Later, move this into:
|
| services/policyEngine.service.js
|
| The policy engine decides whether an action is allowed.
|--------------------------------------------------------------------------
*/

const evaluatePolicy = async (transaction, action, aiDecision) => {
  let allowed = false;
  let reason = "";

  switch (action) {
    case RecoveryAction.RETRY:
      /*
       * Retry only makes sense for temporary failures.
       */
      if (aiDecision && aiDecision.failureCategory === "TEMPORARY") {
        allowed = true;
        reason = "Retry is allowed for temporary payment failures.";
      } else {
        allowed = false;
        reason =
          "Retry is blocked because the transaction failure is not classified as temporary.";
      }
      break;

    case RecoveryAction.NOTIFY_CUSTOMER:
      /*
       * Customer notification is generally safe.
       */
      allowed = true;
      reason = "Customer notification is allowed.";
      break;

    case RecoveryAction.REQUEST_NEW_PAYMENT_METHOD:
      /*
       * A new payment method can be requested when the existing
       * payment attempt cannot reasonably be retried.
       */
      allowed = true;
      reason = "Requesting a new payment method is allowed.";
      break;

    case RecoveryAction.SKIP:
      allowed = true;
      reason = "Recovery has been explicitly skipped.";
      break;

    default:
      allowed = false;
      reason = "Unsupported recovery action.";
  }

  return {
    allowed,
    reason,
  };
};

/*
|--------------------------------------------------------------------------
| POST /api/recovery/transactions/:transactionId
|--------------------------------------------------------------------------
| Create a recovery attempt.
|
| Body:
| {
|   "action": "RETRY"
| }
|--------------------------------------------------------------------------
*/

const createRecoveryAttempt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { action } = req.body;

    const merchantId = req.merchant?.id;

    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
     * Validate action
     */
    if (!action || !Object.values(RecoveryAction).includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recovery action.",
        allowedActions: Object.values(RecoveryAction),
      });
    }

    /*
     * Find transaction belonging to logged-in merchant.
     */
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

    /*
     * Recovery should only happen for failed transactions.
     */
    if (transaction.status !== "FAILED") {
      return res.status(400).json({
        success: false,
        message: "Recovery can only be initiated for failed transactions.",
      });
    }

    /*
     * Prevent recovery when no AI decision exists.
     *
     * This enforces:
     *
     * Failed Transaction
     *        ↓
     *    AI Decision
     *        ↓
     * Recommended Action
     *        ↓
     *    Policy Engine
     */
    if (!transaction.aiDecision) {
      return res.status(400).json({
        success: false,
        message:
          "No AI decision exists for this transaction. Analyze the transaction before starting recovery.",
      });
    }

    /*
     * Check whether the requested action matches the AI recommendation.
     *
     * We don't completely block merchant overrides because a merchant
     * may intentionally choose another action.
     */
    const aiRecommendedAction = transaction.aiDecision.recommendedAction;

    /*
     * Policy Engine
     */
    const policy = await evaluatePolicy(
      transaction,
      action,
      transaction.aiDecision,
    );

    /*
     * Store policy decision.
     */
    const policyDecision = await prisma.policyDecision.create({
      data: {
        transactionId: transaction.id,
        requestedAction: action,
        allowed: policy.allowed,
        reason: policy.reason,
      },
    });

    /*
     * Audit the policy decision.
     */
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

    /*
     * If policy blocks the recovery, create a BLOCKED attempt.
     */
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

    /*
     * Create pending recovery attempt.
     *
     * Actual execution happens through:
     *
     * POST /api/recovery/:recoveryAttemptId/execute
     */
    const recoveryAttempt = await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action,
        status:
          action === RecoveryAction.SKIP
            ? RecoveryStatus.SKIPPED
            : RecoveryStatus.PENDING,
        executedAt: action === RecoveryAction.SKIP ? new Date() : null,
      },
    });

    /*
     * Audit creation.
     */
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
        action === RecoveryAction.SKIP
          ? "Recovery skipped successfully."
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

/*
|--------------------------------------------------------------------------
| POST /api/recovery/:recoveryAttemptId/execute
|--------------------------------------------------------------------------
| Execute a previously approved recovery attempt.
|
| IMPORTANT:
| This MVP simulates execution.
|
| In production, this function should call your payment gateway:
|
| Razorpay / Stripe / Adyen / PayPal / internal payment API
|--------------------------------------------------------------------------
*/

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

    /*
     * Get recovery attempt and verify merchant ownership
     * through the transaction.
     */
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

    /*
     * Only PENDING attempts can be executed.
     */
    if (recoveryAttempt.status !== RecoveryStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Recovery attempt cannot be executed because its current status is ${recoveryAttempt.status}.`,
      });
    }

    const transaction = recoveryAttempt.transaction;

    /*
     * Final policy check.
     *
     * This is important because execution should never blindly trust
     * an earlier decision.
     */
    const policy = await evaluatePolicy(
      transaction,
      recoveryAttempt.action,
      transaction.aiDecision,
    );

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

    /*
     * ---------------------------------------------------------------
     * MOCK EXECUTION
     * ---------------------------------------------------------------
     *
     * Replace this section with the actual payment gateway call.
     *
     * For now:
     *
     * RETRY -> simulated successful recovery
     * NOTIFY_CUSTOMER -> successful execution, but no revenue recovered
     * REQUEST_NEW_PAYMENT_METHOD -> successful request, no revenue yet
     */
    let executionStatus = RecoveryStatus.SUCCESS;
    let amountRecovered = null;
    let failureReason = null;

    switch (recoveryAttempt.action) {
      case RecoveryAction.RETRY:
        /*
         * Simulated retry.
         *
         * In production:
         *
         * const paymentResult = await paymentService.retryPayment(...)
         */
        executionStatus = RecoveryStatus.SUCCESS;
        amountRecovered = transaction.amount;
        break;

      case RecoveryAction.NOTIFY_CUSTOMER:
        /*
         * In production:
         *
         * await notificationService.sendPaymentFailureEmail(...)
         */
        executionStatus = RecoveryStatus.SUCCESS;
        amountRecovered = null;
        break;

      case RecoveryAction.REQUEST_NEW_PAYMENT_METHOD:
        /*
         * In production:
         *
         * await paymentService.requestNewPaymentMethod(...)
         */
        executionStatus = RecoveryStatus.SUCCESS;
        amountRecovered = null;
        break;

      case RecoveryAction.SKIP:
        executionStatus = RecoveryStatus.SKIPPED;
        break;

      default:
        executionStatus = RecoveryStatus.FAILED;
        failureReason = "Unsupported recovery action.";
    }

    /*
     * Update recovery attempt.
     */
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

    /*
     * Audit execution.
     */
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

/*
|--------------------------------------------------------------------------
| GET /api/recovery
|--------------------------------------------------------------------------
| Get all recovery attempts for the logged-in merchant.
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GET /api/recovery/transactions/:transactionId
|--------------------------------------------------------------------------
| Get recovery history for one transaction.
|--------------------------------------------------------------------------
*/

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

    /*
     * Verify transaction ownership.
     */
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

/*
|--------------------------------------------------------------------------
| GET /api/recovery/:recoveryAttemptId
|--------------------------------------------------------------------------
| Get one recovery attempt by ID.
|
| Your requested routes didn't explicitly list this route, but since you
| requested getRecoveryAttemptById(), this endpoint should exist.
|--------------------------------------------------------------------------
*/

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
