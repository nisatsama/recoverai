const SUCCESS_PROBABILITY = {
  BANK_TIMEOUT: 0.7,
  NETWORK_ERROR: 0.8,
  INSUFFICIENT_FUNDS: 0.2,
  EXPIRED_CARD: 0.05,
};

const simulatePayment = (failureReason) => {
  const successProbability = SUCCESS_PROBABILITY[failureReason];

  if (successProbability === undefined) {
    return {
      status: "FAILED",
      reason: "UNKNOWN_FAILURE_REASON",
    };
  }

  const randomValue = Math.random();

  if (randomValue < successProbability) {
    return {
      status: "SUCCESS",
      message: "Payment recovered successfully",
    };
  }

  return {
    status: "FAILED",
    message: "Payment recovery attempt failed",
  };
};

module.exports = {
  simulatePayment,
};
