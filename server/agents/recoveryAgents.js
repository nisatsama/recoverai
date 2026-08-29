const { recoveryDecisionSchema } = require("../schemas/recoveryDecisionSchema");
const { fallbackDecision } = require("./fallbackRules");
const ALLOWED_ACTIONS = Object.freeze([
  "RETRY",
  "SEND_REMINDER",
  "UPDATE_PAYMENT_METHOD",
  "ESCALATE",
  "NO_ACTION",
]);

const SYSTEM_PROMPT = `
You are a payment revenue recovery analyst.

Analyze a failed payment transaction.

Determine:

1. Failure category
2. Failure explanation
3. Recommended recovery action
4. Confidence score
5. Recovery probability

Allowed failure categories:
TEMPORARY
CUSTOMER_ACTION_REQUIRED
PERMANENT
RISK

Allowed actions:
RETRY
SEND_REMINDER
UPDATE_PAYMENT_METHOD
ESCALATE
NO_ACTION

Never:
- execute payments
- refund money
- change transaction amounts
- change customers
- delete transactions
- transfer money

Return JSON only.

The JSON must contain exactly:
{
  "failureCategory": "...",
  "reason": "...",
  "recommendedAction": "...",
  "confidence": 0,
  "recoveryProbability": 0
}
`;

function buildTransactionPrompt(transaction) {
  return `
Analyze this failed transaction:

Amount: ${transaction.amount}
Currency: ${transaction.currency}
Payment Method: ${transaction.paymentMethod}
Failure Reason: ${transaction.failureReason}

Return only the required JSON decision.
`;
}

function fallbackDecision(transaction) {
  const { failureReason } = transaction;

  switch (failureReason) {
    case "BANK_TIMEOUT":
    case "NETWORK_ERROR":
      return {
        failureCategory: "TEMPORARY",
        reason: "The payment failure appears potentially transient.",
        recommendedAction: "RETRY",
        confidence: 0.8,
        recoveryProbability: 0.7,
      };

    case "INSUFFICIENT_FUNDS":
      return {
        failureCategory: "CUSTOMER_ACTION_REQUIRED",
        reason:
          "The payment could not be completed because sufficient funds were unavailable.",
        recommendedAction: "SEND_REMINDER",
        confidence: 0.85,
        recoveryProbability: 0.55,
      };

    case "CARD_DECLINED":
      return {
        failureCategory: "CUSTOMER_ACTION_REQUIRED",
        reason: "The card was declined and may require another payment method.",
        recommendedAction: "UPDATE_PAYMENT_METHOD",
        confidence: 0.8,
        recoveryProbability: 0.5,
      };

    default:
      return {
        failureCategory: "RISK",
        reason: "The failure reason could not be safely classified.",
        recommendedAction: "ESCALATE",
        confidence: 0.5,
        recoveryProbability: 0.2,
      };
  }
}

async function analyzeTransaction(transaction, llm) {
  try {
    const prompt = buildTransactionPrompt(transaction);

    const rawResponse = await llm({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: prompt,
    });

    const parsedResponse =
      typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse;

    const validatedDecision = recoveryDecisionSchema.parse(parsedResponse);

    if (!ALLOWED_ACTIONS.includes(validatedDecision.recommendedAction)) {
      throw new Error("AI returned an unsupported action");
    }

    return {
      ...validatedDecision,
      source: "AI",
    };
  } catch (error) {
    console.error("Recovery agent failed:", error.message);

    return {
      ...fallbackDecision(transaction),
      source: "FALLBACK",
    };
  }
}

module.exports = {
  analyzeTransaction,
};
