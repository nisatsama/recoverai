const prisma = require("../config/prisma");

/**
 * Create an immutable audit log entry.
 *
 * This function should be called internally by other services/controllers.
 */
const createAuditLog = async ({
  transactionId,
  event,
  actor,
  metadata = null,
}) => {
  if (!transactionId) {
    throw new Error("transactionId is required");
  }

  if (!event) {
    throw new Error("event is required");
  }

  if (!actor) {
    throw new Error("actor is required");
  }

  return prisma.auditLog.create({
    data: {
      transactionId,
      event,
      actor,
      metadata,
    },
  });
};

module.exports = {
  createAuditLog,
};
