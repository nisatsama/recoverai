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

const getRecoveryAttempts = async () => {
  return prisma.recoveryAttempt.count();
};

const getSuccessfulRecoveries = async () => {
  return prisma.recoveryAttempt.count({
    where: {
      status: "SUCCESS",
    },
  });
};

const getRecoveredRevenue = async () => {
  const result = await prisma.recoveryAttempt.aggregate({
    where: {
      status: "SUCCESS",
    },
    _sum: {
      amountRecovered: true,
    },
  });

  return result._sum.amountRecovered || 0;
};
const getRecoveryRate = async () => {
  const totalAttempts = await getRecoveryAttempts();

  if (totalAttempts === 0) {
    return 0;
  }

  const successfulRecoveries = await getSuccessfulRecoveries();

  return (successfulRecoveries / totalAttempts) * 100;
};
const getOverview = async () => {
  const [
    revenueAtRisk,
    recoveryAttempts,
    successfulRecoveries,
    recoveredRevenue,
    recoveryRate,
  ] = await Promise.all([
    getRevenueAtRisk(),
    getRecoveryAttempts(),
    getSuccessfulRecoveries(),
    getRecoveredRevenue(),
    getRecoveryRate(),
  ]);

  return {
    revenueAtRisk,
    recoveryAttempts,
    successfulRecoveries,
    recoveredRevenue,
    recoveryRate,
  };
};
module.exports = {
  getRevenueAtRisk,
  getRecoveryAttempts,
  getSuccessfulRecoveries,
  getRecoveredRevenue,
  getRecoveryRate,
  getOverview,
};
