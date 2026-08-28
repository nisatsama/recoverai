const prisma = require("../config/prisma");
const aiService = require("../services/ai.service");

/**
 * POST /api/ai/transactions/:transactionId/analyze
 * Analyze a failed transaction using the AI service
 */
const createAIDecision = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant.id;

    // 1. Find transaction and verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        merchantId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 2. AI analysis should only be performed on failed transactions
    if (transaction.status !== "FAILED") {
      return res.status(400).json({
        success: false,
        message: "AI analysis is only available for failed transactions",
      });
    }

    // 3. Check whether an AI decision already exists
    const existingDecision = await prisma.aIDecision.findUnique({
      where: {
        transactionId,
      },
    });

    if (existingDecision) {
      return res.status(409).json({
        success: false,
        message: "AI decision already exists for this transaction",
        data: existingDecision,
      });
    }

    // 4. Delegate actual AI analysis to the AI service
    const analysis = await aiService.analyzeTransaction(transaction);

    /*
      Expected service response:

      {
        failureCategory: "TEMPORARY",
        reason: "Bank server temporarily unavailable",
        recommendedAction: "RETRY",
        confidence: 0.91,
        recoveryProbability: 0.78
      }
    */

    // 5. Validate AI service response
    if (
      !analysis ||
      !analysis.failureCategory ||
      !analysis.reason ||
      !analysis.recommendedAction ||
      analysis.confidence === undefined ||
      analysis.recoveryProbability === undefined
    ) {
      return res.status(500).json({
        success: false,
        message: "AI service returned an invalid response",
      });
    }

    // 6. Store AI decision
    const aiDecision = await prisma.aIDecision.create({
      data: {
        transactionId: transaction.id,
        failureCategory: analysis.failureCategory,
        reason: analysis.reason,
        recommendedAction: analysis.recommendedAction,
        confidence: analysis.confidence,
        recoveryProbability: analysis.recoveryProbability,
      },
    });

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        transactionId: transaction.id,
        event: "AI_DECISION_CREATED",
        actor: "AI",
        metadata: {
          failureCategory: analysis.failureCategory,
          recommendedAction: analysis.recommendedAction,
          confidence: analysis.confidence,
          recoveryProbability: analysis.recoveryProbability,
        },
      },
    });

    // 8. Return result
    return res.status(201).json({
      success: true,
      message: "AI decision created successfully",
      data: aiDecision,
    });
  } catch (error) {
    console.error("createAIDecision error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create AI decision",
    });
  }
};

/**
 * GET /api/ai/transactions/:transactionId
 * Get AI decision for a specific transaction
 */
const getAIDecision = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant.id;

    // Verify transaction belongs to merchant
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        merchantId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Fetch AI decision
    const aiDecision = await prisma.aIDecision.findUnique({
      where: {
        transactionId,
      },
    });

    if (!aiDecision) {
      return res.status(404).json({
        success: false,
        message: "AI decision not found for this transaction",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiDecision,
    });
  } catch (error) {
    console.error("getAIDecision error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI decision",
    });
  }
};

/**
 * GET /api/ai/decisions
 * Get all AI decisions for the authenticated merchant
 */
const getAIDecisions = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const aiDecisions = await prisma.aIDecision.findMany({
      where: {
        transaction: {
          merchantId,
        },
      },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            currency: true,
            paymentMethod: true,
            status: true,
            failureReason: true,
            customerEmail: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: aiDecisions.length,
      data: aiDecisions,
    });
  } catch (error) {
    console.error("getAIDecisions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI decisions",
    });
  }
};

module.exports = {
  createAIDecision,
  getAIDecision,
  getAIDecisions,
};
