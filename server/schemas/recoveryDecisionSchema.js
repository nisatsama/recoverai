const { z } = require("zod");

const recoveryDecisionSchema = z
  .object({
    failureCategory: z.enum([
      "TEMPORARY",
      "CUSTOMER_ACTION_REQUIRED",
      "PERMANENT",
      "RISK",
    ]),

    reason: z.string().min(1).max(500),

    recommendedAction: z.enum([
      "RETRY",
      "SEND_REMINDER",
      "UPDATE_PAYMENT_METHOD",
      "ESCALATE",
      "NO_ACTION",
    ]),

    confidence: z.number().min(0).max(1),

    recoveryProbability: z.number().min(0).max(1),
  })
  .strict();

module.exports = {
  recoveryDecisionSchema,
};
