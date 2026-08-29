const FALLBACK_RULES = Object.freeze({
  BANK_TIMEOUT: {
    failureCategory: "TEMPORARY",
    reason: "The payment failure appears potentially transient.",
    recommendedAction: "RETRY",
    confidence: 0.8,
    recoveryProbability: 0.7,
  },

  NETWORK_ERROR: {
    failureCategory: "TEMPORARY",
    reason: "The payment failure appears potentially transient.",
    recommendedAction: "RETRY",
    confidence: 0.8,
    recoveryProbability: 0.7,
  },

  INSUFFICIENT_FUNDS: {
    failureCategory: "CUSTOMER_ACTION_REQUIRED",
    reason:
      "The payment could not be completed because sufficient funds were unavailable.",
    recommendedAction: "SEND_REMINDER",
    confidence: 0.85,
    recoveryProbability: 0.55,
  },

  CARD_DECLINED: {
    failureCategory: "CUSTOMER_ACTION_REQUIRED",
    reason: "The card was declined and may require another payment method.",
    recommendedAction: "UPDATE_PAYMENT_METHOD",
    confidence: 0.8,
    recoveryProbability: 0.5,
  },

  EXPIRED_CARD: {
    failureCategory: "CUSTOMER_ACTION_REQUIRED",
    reason: "The payment method has expired and needs to be updated.",
    recommendedAction: "UPDATE_PAYMENT_METHOD",
    confidence: 0.95,
    recoveryProbability: 0.75,
  },

  FRAUD_SUSPECTED: {
    failureCategory: "RISK",
    reason:
      "The transaction may involve suspicious activity and requires review.",
    recommendedAction: "ESCALATE",
    confidence: 0.95,
    recoveryProbability: 0.05,
  },

  INVALID_DETAILS: {
    failureCategory: "CUSTOMER_ACTION_REQUIRED",
    reason: "The payment details appear invalid and need to be corrected.",
    recommendedAction: "UPDATE_PAYMENT_METHOD",
    confidence: 0.9,
    recoveryProbability: 0.65,
  },
});

function fallbackDecision(transaction) {
  const rule = FALLBACK_RULES[transaction.failureReason];

  if (!rule) {
    return {
      failureCategory: "RISK",
      reason: "The failure reason could not be safely classified.",
      recommendedAction: "ESCALATE",
      confidence: 0.5,
      recoveryProbability: 0.2,
    };
  }

  return rule;
}

module.exports = {
  fallbackDecision,
  FALLBACK_RULES,
};
