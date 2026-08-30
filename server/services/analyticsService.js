const prisma = require("../config/prisma");

const getRevenueAtRisk = async () => {
  const result = await prisma.transaction.aggregate({
    where: {
      status: "FAILED",
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount || 0;
};

module.exports = {
  getRevenueAtRisk,
};
