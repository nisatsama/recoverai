const MAX_RETRIES = 3;
const HIGH_VALUE_THRESHOLD = 10000;

const evaluateRecoveryPolicy = (transaction, aiDecision) => {
  // Rule 1: Transaction already succeeded
  if (transaction.status === "SUCCESS") {
    return {
      allowed: false,
      action: "NO_ACTION",
      reason: "Transaction has already been successfully recovered.",
    };
  }

  // Rule 2: Fraud must never be automatically recovered
  if (transaction.failureReason === "FRAUD_SUSPECTED") {
    return {
      allowed: false,
      action: "ESCALATE",
      reason: "Fraud-suspected transactions cannot be automatically recovered.",
    };
  }

  // Rule 3: High-value transactions require escalation
  if (Number(transaction.amount) > HIGH_VALUE_THRESHOLD) {
    return {
      allowed: false,
      action: "ESCALATE",
      reason: "High-value transactions require manual review before recovery.",
    };
  }

  // Rule 4: Maximum retry attempts
  if (
    aiDecision.recommendedAction === "RETRY" &&
    transaction.retryCount >= MAX_RETRIES
  ) {
    return {
      allowed: false,
      action: "RETRY",
      reason: "Maximum retry attempts exceeded.",
    };
  }

  // // Rule 5: Permanent failure
  // if (transaction.failureReason === "CARD_DECLINED") {
  //   return {
  //     allowed: false,
  //     action: "NO_ACTION",
  //     reason: "Card-declined transactions are treated as permanent failures.",
  //   };
  // }

  if (aiDecision.recommendedAction === "RETRY") {
    if (aiDecision.failureCategory !== "TEMPORARY") {
      return {
        allowed: false,
        action: "RETRY",
        reason: "Retry is only permitted for temporary failures.",
      };
    }

    return {
      allowed: true,
      action: "RETRY",
      reason: "Temporary failure and retry count is below the maximum.",
    };
  }

  if (aiDecision.recommendedAction === "SEND_REMINDER") {
    return {
      allowed: true,
      action: "SEND_REMINDER",
      reason: "Customer follow-up is permitted for this transaction.",
    };
  }

  if (aiDecision.recommendedAction === "UPDATE_PAYMENT_METHOD") {
    if (aiDecision.failureCategory !== "CUSTOMER_ACTION_REQUIRED") {
      return {
        allowed: false,
        action: "UPDATE_PAYMENT_METHOD",
        reason:
          "Payment method updates are only permitted when customer action is required.",
      };
    }

    return {
      allowed: true,
      action: "UPDATE_PAYMENT_METHOD",
      reason: "Customer is required to update their payment method.",
    };
  }

  if (aiDecision.recommendedAction === "ESCALATE") {
    return {
      allowed: true,
      action: "ESCALATE",
      reason: "AI recommends manual intervention.",
    };
  }

  // Safety fallback
  if (aiDecision.recommendedAction === "NO_ACTION") {
    return {
      allowed: true,
      action: "NO_ACTION",
      reason: "No recovery action is required.",
    };
  }
  return {
    allowed: false,
    action: "NO_ACTION",
    reason: "Unknown recovery action. Recovery blocked by policy.",
  };
};

module.exports = {
  evaluateRecoveryPolicy,
  MAX_RETRIES,
  HIGH_VALUE_THRESHOLD,
};
