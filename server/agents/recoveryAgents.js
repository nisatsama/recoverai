const { analyzeTransaction: analyzeWithAI } = require("../services/aiService");
const { fallbackDecision } = require("./fallbackRules");

async function analyzeTransaction(transaction) {
  try {
    const decision = await analyzeWithAI(transaction);

    return {
      ...decision,
      source: "AI",
    };
  } catch (error) {
    console.error(
      "AI recovery analysis failed. Using fallback rules:",
      error.message,
    );

    return {
      ...fallbackDecision(transaction),
      source: "FALLBACK",
    };
  }
}

module.exports = {
  analyzeTransaction,
};
