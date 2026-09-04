const prisma = require("../config/prisma");
const { analyzeTransaction } = require("../agents/recoveryAgents");
const createAIDecision = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant.id;
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
    if (transaction.status !== "FAILED") {
      return res.status(400).json({
        success: false,
        message: "AI analysis is only available for failed transactions",
      });
    }
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
    const analysis = await analyzeTransaction(transaction);
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
const getAIDecision = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const merchantId = req.merchant.id;
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
