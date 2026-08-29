const { z } = require("zod");

const createTransactionSchema = z
  .object({
    amount: z.coerce.number().positive(),

    currency: z
      .string()
      .length(3)
      .transform((value) => value.toUpperCase()),

    paymentMethod: z.enum([
      "UPI",
      "CARD",
      "NET_BANKING",
      "WALLET",
      "BANK_TRANSFER",
    ]),

    status: z.enum(["PENDING", "SUCCESS", "FAILED"]),

    failureReason: z
      .enum([
        "BANK_TIMEOUT",
        "INSUFFICIENT_FUNDS",
        "CARD_DECLINED",
        "NETWORK_ERROR",
        "EXPIRED_CARD",
        "INVALID_DETAILS",
        "FRAUD_SUSPECTED",
        "UNKNOWN",
      ])
      .nullable()
      .optional(),

    customerEmail: z.string().email(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "FAILED" && !data.failureReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["failureReason"],
        message: "Failure reason is required for failed transactions",
      });
    }

    if (data.status !== "FAILED" && data.failureReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["failureReason"],
        message: "Failure reason is only allowed for failed transactions",
      });
    }
  });

module.exports = {
  createTransactionSchema,
};
