const prisma = require("../config/prisma");

// GET /api/audit
// Get audit logs for the authenticated merchant
const getAuditLogs = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const { event, actor, transactionId, page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      transaction: {
        merchantId,
      },
    };

    if (event) {
      where.event = event;
    }

    if (actor) {
      where.actor = actor;
    }

    if (transactionId) {
      where.transactionId = transactionId;
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              currency: true,
              paymentMethod: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNumber,
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: auditLogs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};

// GET /api/audit/transactions/:transactionId
// Get audit history for one transaction
const getTransactionAuditLogs = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant.id;

    // Make sure the transaction belongs to the authenticated merchant
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        merchantId,
      },
      select: {
        id: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        transactionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: auditLogs,
    });
  } catch (error) {
    console.error("Get transaction audit logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction audit logs",
    });
  }
};

module.exports = {
  getAuditLogs,
  getTransactionAuditLogs,
};
