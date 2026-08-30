const SUCCESS_PROBABILITY = {
  BANK_TIMEOUT: 0.7,
  NETWORK_ERROR: 0.8,
  INSUFFICIENT_FUNDS: 0.2,
  EXPIRED_CARD: 0.05,
};

const simulatePayment = (transaction) => {
  const successProbability = SUCCESS_PROBABILITY[transaction.failureReason];

  if (successProbability === undefined) {
    return {
      status: "FAILED",
      reason: "UNKNOWN_FAILURE_REASON",
    };
  }

  const success = Math.random() < successProbability;

  if (success) {
    return {
      status: "SUCCESS",
      transactionStatus: "PAID",
      message: "Payment recovered successfully",
    };
  }

  return {
    status: "FAILED",
    transactionStatus: "FAILED",
    message: "Payment recovery attempt failed",
  };
};

module.exports = {
  simulatePayment,
};
