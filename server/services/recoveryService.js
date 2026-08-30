const prisma = require("../config/prisma");
const paymentProvider = require("./paymentProvider");
const { createAuditLog } = require("./auditService");

const executeRecovery = async (transaction, decision) => {
  if (transaction.status !== "FAILED") {
    return {
      status: "BLOCKED",
      reason: "Only FAILED transactions can be recovered",
    };
  }

  switch (decision.recommendedAction) {
    case "RETRY": {
      await createAuditLog({
        transactionId: transaction.id,
        event: "RECOVERY_STARTED",
        actor: "SYSTEM",
        metadata: {
          action: decision.recommendedAction,
          amount: transaction.amount.toString(),
          currency: transaction.currency,
        },
      });

      const result = await paymentProvider.retryPayment({
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: transaction.paymentMethod,
        failureReason: transaction.failureReason,
      });

      const recoveryAttempt = await prisma.$transaction(async (tx) => {
        const attempt = await tx.recoveryAttempt.create({
          data: {
            transactionId: transaction.id,
            action: decision.recommendedAction,
            status: result.status === "SUCCESS" ? "SUCCESS" : "FAILED",
            amountRecovered:
              result.status === "SUCCESS" ? transaction.amount : null,
            executedAt: new Date(),
            failureReason:
              result.status === "FAILED" ? transaction.failureReason : null,
          },
        });

        if (result.status === "SUCCESS") {
          await tx.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: "SUCCESS",
            },
          });
        }

        return attempt;
      });

      await createAuditLog({
        transactionId: transaction.id,
        event:
          result.status === "SUCCESS"
            ? "RECOVERY_SUCCEEDED"
            : "RECOVERY_FAILED",
        actor: "SYSTEM",
        metadata: {
          action: decision.recommendedAction,
          amountRecovered:
            result.status === "SUCCESS" ? transaction.amount.toString() : "0",
          message: result.message,
        },
      });

      return {
        status: result.status,
        transactionStatus: result.transactionStatus,
        message: result.message,
        recoveryAttemptId: recoveryAttempt.id,
      };
    }

    case "NOTIFY_CUSTOMER":
      return {
        status: "SKIPPED",
        message: "Customer notification will be handled separately",
      };

    case "REQUEST_NEW_PAYMENT_METHOD":
      return {
        status: "SKIPPED",
        message: "Payment method update will be handled separately",
      };

    case "SKIP":
      return {
        status: "SKIPPED",
        message: "Recovery skipped by decision",
      };

    default:
      return {
        status: "BLOCKED",
        reason: "Unsupported recovery action",
      };
  }
};

module.exports = {
  executeRecovery,
};
