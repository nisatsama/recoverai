const paymentProvider = require("./paymentProvider");

const executeRecovery = async (transaction, decision) => {
  if (decision.recommendedAction !== "RETRY") {
    return {
      status: "BLOCKED",
      reason: "Recovery action is not RETRY",
    };
  }

  const result = await paymentProvider.retryPayment({
    transactionId: transaction.id,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    failureReason: transaction.failureReason,
  });

  return {
    status: result.status,
    transactionStatus: result.transactionStatus,
    message: result.message,
  };
};

module.exports = {
  executeRecovery,
};
