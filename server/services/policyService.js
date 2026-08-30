const prisma = require("../config/prisma");
const { evaluateRecoveryPolicy } = require("../policies/recoveryPolicy");

const evaluatePolicy = (transaction, aiDecision) => {
  return evaluateRecoveryPolicy(transaction, aiDecision);
};

const createPolicyDecision = async ({
  transactionId,
  requestedAction,
  allowed,
  reason,
}) => {
  const decision = await prisma.policyDecision.create({
    data: {
      transactionId,
      requestedAction,
      allowed,
      reason,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      transactionId,
      event: "POLICY_EVALUATED",
      actor: "POLICY_ENGINE",
      metadata: {
        requestedAction,
        allowed,
        reason,
        policyDecisionId: decision.id,
      },
    },
  });

  return decision;
};

module.exports = {
  evaluatePolicy,
  createPolicyDecision,
};
