const OpenAI = require("openai");
const { recoveryDecisionSchema } = require("../schemas/recoveryDecisionSchema");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are RecoverAI, an AI-assisted payment recovery decision engine.

Your job is to analyze a failed payment transaction and recommend the safest
recovery action.

You are a DECISION SUPPORT system. You do NOT execute payments and you must
never claim that a payment was retried, recovered, refunded, or completed.

Allowed failure categories:
- TEMPORARY
- CUSTOMER_ACTION_REQUIRED
- PERMANENT
- RISK

Allowed recovery actions:
- RETRY
- SEND_REMINDER
- UPDATE_PAYMENT_METHOD
- ESCALATE
- NO_ACTION

Decision rules:

1. TEMPORARY failures such as bank timeouts or network errors may be eligible
   for RETRY, especially when retryCount is low.

2. INSUFFICIENT_FUNDS generally requires customer action. Prefer
   SEND_REMINDER rather than immediately retrying.

3. CARD_DECLINED generally requires the customer to use or update another
   payment method. Prefer UPDATE_PAYMENT_METHOD.

4. EXPIRED_CARD should result in UPDATE_PAYMENT_METHOD.

5. INVALID_DETAILS should generally result in UPDATE_PAYMENT_METHOD.

6. FRAUD_SUSPECTED is a RISK condition. Never recommend RETRY for suspected
   fraud. Prefer ESCALATE.

7. PERMANENT failures should generally result in NO_ACTION or
   UPDATE_PAYMENT_METHOD depending on the failure reason.

8. High-value transactions require additional caution. When the transaction
   carries significant financial risk or the available information is
   insufficient, prefer ESCALATE over an aggressive automatic recovery action.

9. Consider retryCount when deciding whether another retry is reasonable.
   Repeated failures should reduce confidence in RETRY.

10. Never invent missing transaction information.

11. Do not use information that is not present in the transaction context.

12. confidence represents how confident you are in the classification and
    recommended action, between 0 and 1.

13. recoveryProbability represents the estimated probability that the payment
    can eventually be recovered using the recommended strategy, between 0 and 1.
    It is NOT the probability that the next immediate retry will succeed.

14. Return ONLY a JSON object containing exactly these fields:

{
  "failureCategory": "TEMPORARY | CUSTOMER_ACTION_REQUIRED | PERMANENT | RISK",
  "reason": "short explanation",
  "recommendedAction": "RETRY | SEND_REMINDER | UPDATE_PAYMENT_METHOD | ESCALATE | NO_ACTION",
  "confidence": 0.0,
  "recoveryProbability": 0.0
}

Do not include markdown.
Do not include code fences.
Do not include additional fields.
`;

async function analyzeTransaction(transaction) {
  try {
    const userPrompt = `
Analyze the following failed payment transaction.

Transaction context:
${JSON.stringify(
  {
    transactionId: transaction.id,
    amount: transaction.amount,
    currency: transaction.currency || "INR",
    paymentMethod: transaction.paymentMethod,
    failureReason: transaction.failureReason,
    retryCount: transaction.retryCount,
  },
  null,
  2,
)}

Return only the requested JSON decision.
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const rawDecision = JSON.parse(response.output_text);

    const decision = recoveryDecisionSchema.parse(rawDecision);

    return decision;
  } catch (error) {
    console.error("AI recovery analysis failed:", error);
    throw error;
  }
}

module.exports = {
  analyzeTransaction,
};
