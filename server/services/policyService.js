const prisma = require("../config/prisma");

/**
 * Evaluate whether a requested recovery action is allowed.
 *
 * IMPORTANT:
 * All policy/business rules belong here, not in the controller.
 */
const evaluatePolicy = async (transaction, requestedAction) => {
  let allowed = false;
  let reason = "";

  // Transaction must be failed before recovery actions can be considered.
  if (transaction.status !== "FAILED") {
    return {
      requestedAction,
      allowed: false,
      reason: "Transaction is not in a failed state",
    };
  }

  switch (requestedAction) {
    case "RETRY":
      if (transaction.aiDecision?.failureCategory === "TEMPORARY") {
        allowed = true;
        reason = "Temporary failure and transaction is eligible for retry";
      } else {
        allowed = false;
        reason = "Transaction failure is not classified as temporary";
      }
      break;

    case "NOTIFY_CUSTOMER":
      allowed = true;
      reason = "Customer notification is allowed for failed transactions";
      break;

    case "REQUEST_NEW_PAYMENT_METHOD":
      if (
        transaction.aiDecision?.failureCategory === "CUSTOMER_ACTION_REQUIRED"
      ) {
        allowed = true;
        reason =
          "Customer action is required and a new payment method can be requested";
      } else {
        allowed = false;
        reason = "Failure does not require a new payment method";
      }
      break;

    case "SKIP":
      allowed = true;
      reason = "Recovery can be skipped for this transaction";
      break;

    default:
      allowed = false;
      reason = "Unsupported recovery action";
  }

  return {
    requestedAction,
    allowed,
    reason,
  };
};

/**
 * Persist a policy decision.
 */
const createPolicyDecision = async ({
  transactionId,
  requestedAction,
  allowed,
  reason,
}) => {
  const decision = await prisma.policyDecision.create({
    data: {
      transactionId,
      requestedAction,
      allowed,
      reason,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      transactionId,
      event: "POLICY_EVALUATED",
      actor: "POLICY_ENGINE",
      metadata: {
        requestedAction,
        allowed,
        reason,
        policyDecisionId: decision.id,
      },
    },
  });

  return decision;
};

module.exports = {
  evaluatePolicy,
  createPolicyDecision,
};
