const { simulatePayment } = require("./paymentSimulator");

const paymentProvider = {
  retryPayment: async ({
    transactionId,
    amount,
    currency,
    paymentMethod,
    failureReason,
  }) => {
    console.log("Payment retry initiated:", {
      transactionId,
      amount,
      currency,
      paymentMethod,
      failureReason,
    });

    return simulatePayment(failureReason);
  },
};

module.exports = paymentProvider;
