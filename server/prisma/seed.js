require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const FAILURE_DISTRIBUTION = [
  ["BANK_TIMEOUT", 20],
  ["NETWORK_ERROR", 15],
  ["INSUFFICIENT_FUNDS", 20],
  ["CARD_DECLINED", 15],
  ["EXPIRED_CARD", 10],
  ["INVALID_DETAILS", 10],
  ["FRAUD_SUSPECTED", 5],
  ["UNKNOWN", 5],
];

const paymentMethods = [
  "UPI",
  "CARD",
  "NET_BANKING",
  "WALLET",
  "BANK_TRANSFER",
];

const recoveryProfiles = {
  BANK_TIMEOUT: {
    category: "TEMPORARY",
    action: "RETRY",
    probability: 0.82,
    confidence: 0.94,
    reason: "Temporary bank timeout. Retrying the transaction may succeed.",
  },

  NETWORK_ERROR: {
    category: "TEMPORARY",
    action: "RETRY",
    probability: 0.86,
    confidence: 0.95,
    reason: "Network failure detected. A retry is likely to succeed.",
  },

  INSUFFICIENT_FUNDS: {
    category: "CUSTOMER_ACTION_REQUIRED",
    action: "NOTIFY_CUSTOMER",
    probability: 0.68,
    confidence: 0.91,
    reason: "Customer needs to add funds before another payment attempt.",
  },

  CARD_DECLINED: {
    category: "CUSTOMER_ACTION_REQUIRED",
    action: "REQUEST_NEW_PAYMENT_METHOD",
    probability: 0.58,
    confidence: 0.88,
    reason: "Card was declined. Requesting another payment method is safer.",
  },

  EXPIRED_CARD: {
    category: "PERMANENT",
    action: "REQUEST_NEW_PAYMENT_METHOD",
    probability: 0.35,
    confidence: 0.97,
    reason: "The payment card appears to be expired.",
  },

  INVALID_DETAILS: {
    category: "CUSTOMER_ACTION_REQUIRED",
    action: "REQUEST_NEW_PAYMENT_METHOD",
    probability: 0.25,
    confidence: 0.93,
    reason: "Invalid payment details require customer correction.",
  },

  FRAUD_SUSPECTED: {
    category: "PERMANENT",
    action: "SKIP",
    probability: 0.02,
    confidence: 0.99,
    reason: "Potential fraud detected. Automatic recovery should be blocked.",
  },

  UNKNOWN: {
    category: "UNKNOWN",
    action: "NOTIFY_CUSTOMER",
    probability: 0.3,
    confidence: 0.65,
    reason: "Failure reason is unknown. Customer notification is recommended.",
  },
};

function randomAmount() {
  const amounts = [
    499, 799, 999, 1299, 1499, 1999, 2499, 2999, 3499, 4999, 5999, 7499, 8999,
    9999, 12499, 14999,
  ];

  return amounts[Math.floor(Math.random() * amounts.length)];
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate() {
  const now = Date.now();

  // Transactions from the last 30 days
  const daysAgo = Math.floor(Math.random() * 30);

  return new Date(
    now -
      daysAgo * 24 * 60 * 60 * 1000 -
      Math.floor(Math.random() * 24 * 60 * 60 * 1000),
  );
}

function decimal(value) {
  return value.toFixed(2);
}

async function main() {
  console.log("🌱 Starting RecoverAI seed...");

  // ---------------------------------------------------------
  // 1. Create / reuse demo merchant
  // ---------------------------------------------------------

  let merchant = await prisma.merchant.findUnique({
    where: {
      email: "demo@recoverai.com",
    },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: "Demo Merchant",
        email: "demo@recoverai.com",
        password: null,
        authProvider: "local",
      },
    });
  }

  console.log(`Merchant: ${merchant.email}`);

  // ---------------------------------------------------------
  // 2. Clear previous demo transactions
  // ---------------------------------------------------------

  await prisma.transaction.deleteMany({
    where: {
      merchantId: merchant.id,
    },
  });

  console.log("🧹 Previous demo transactions removed.");

  // ---------------------------------------------------------
  // 3. Build failure reason list
  // ---------------------------------------------------------

  const failureReasons = [];

  for (const [reason, count] of FAILURE_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      failureReasons.push(reason);
    }
  }

  // Shuffle
  failureReasons.sort(() => Math.random() - 0.5);

  // ---------------------------------------------------------
  // 4. Create transactions
  // ---------------------------------------------------------

  const transactions = [];

  for (let i = 0; i < 100; i++) {
    const failureReason = failureReasons[i];

    const transaction = await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        amount: decimal(randomAmount()),
        currency: "INR",
        paymentMethod: randomItem(paymentMethods),
        status: "FAILED",
        failureReason,
        customerEmail: `customer${i + 1}@example.com`,
        createdAt: randomDate(),
      },
    });

    transactions.push(transaction);
  }

  console.log(`💳 Created ${transactions.length} transactions.`);

  // ---------------------------------------------------------
  // 5. Create AI decisions
  // ---------------------------------------------------------

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    const profile = recoveryProfiles[transaction.failureReason];

    await prisma.aIDecision.create({
      data: {
        transactionId: transaction.id,
        failureCategory: profile.category,
        reason: profile.reason,
        recommendedAction: profile.action,
        confidence: decimal(profile.confidence),
        recoveryProbability: decimal(profile.probability),
        createdAt: transaction.createdAt,
      },
    });
  }

  console.log("🤖 AI decisions created.");

  // ---------------------------------------------------------
  // 6. Determine eligible transactions
  //
  // Exactly 67 eligible
  // Exactly 48 successful
  // Exactly 19 failed
  // ---------------------------------------------------------

  const eligibleTransactions = [...transactions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 67);

  const successfulTransactions = eligibleTransactions
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 48);

  const successfulIds = new Set(
    successfulTransactions.map((transaction) => transaction.id),
  );

  const eligibleIds = new Set(
    eligibleTransactions.map((transaction) => transaction.id),
  );

  // ---------------------------------------------------------
  // 7. Create policy decisions
  // ---------------------------------------------------------

  for (const transaction of transactions) {
    const profile = recoveryProfiles[transaction.failureReason];

    const eligible = eligibleIds.has(transaction.id);

    const allowed =
      eligible &&
      profile.action !== "SKIP" &&
      profile.action !== "REQUEST_NEW_PAYMENT_METHOD";

    await prisma.policyDecision.create({
      data: {
        transactionId: transaction.id,
        requestedAction: profile.action,
        allowed,
        reason: allowed
          ? "Recovery action allowed by policy."
          : "Recovery action is not eligible for automatic execution.",
        createdAt: transaction.createdAt,
      },
    });
  }

  console.log("🛡️ Policy decisions created.");

  // ---------------------------------------------------------
  // 8. Create recovery attempts
  // ---------------------------------------------------------

  for (const transaction of eligibleTransactions) {
    const profile = recoveryProfiles[transaction.failureReason];

    const success = successfulIds.has(transaction.id);

    const executedAt = new Date(
      transaction.createdAt.getTime() +
        Math.floor(Math.random() * 6 + 1) * 60 * 60 * 1000,
    );

    await prisma.recoveryAttempt.create({
      data: {
        transactionId: transaction.id,
        action: profile.action,
        status: success ? "SUCCESS" : "FAILED",
        amountRecovered: success ? transaction.amount : null,
        executedAt,
        failureReason: success
          ? null
          : "Recovery attempt did not recover the payment.",
      },
    });
  }

  console.log("🔄 Recovery attempts created.");

  // ---------------------------------------------------------
  // 9. Create audit logs
  // ---------------------------------------------------------

  for (const transaction of transactions) {
    const eligible = eligibleIds.has(transaction.id);
    const successful = successfulIds.has(transaction.id);

    await prisma.auditLog.create({
      data: {
        transactionId: transaction.id,
        event: successful
          ? "PAYMENT_RECOVERED"
          : eligible
            ? "RECOVERY_ATTEMPT_FAILED"
            : "PAYMENT_FAILURE_ANALYZED",
        actor: successful ? "AI" : "POLICY_ENGINE",
        metadata: {
          failureReason: transaction.failureReason,
          recoveryEligible: eligible,
          recovered: successful,
        },
        createdAt: transaction.createdAt,
      },
    });
  }

  console.log("📋 Audit logs created.");

  // ---------------------------------------------------------
  // 10. Dashboard statistics
  // ---------------------------------------------------------

  const totalRevenue = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0,
  );

  const recoveredRevenue = successfulTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0,
  );

  console.log("\n=================================");
  console.log("        RECOVERAI SEED");
  console.log("=================================");
  console.log(`Transactions       : ${transactions.length}`);
  console.log(`Eligible           : ${eligibleTransactions.length}`);
  console.log(`Successful         : ${successfulTransactions.length}`);
  console.log(
    `Failed recovery    : ${
      eligibleTransactions.length - successfulTransactions.length
    }`,
  );
  console.log(`Revenue at risk    : ₹${totalRevenue.toFixed(2)}`);
  console.log(`Recovered revenue  : ₹${recoveredRevenue.toFixed(2)}`);
  console.log(
    `Recovery rate      : ${(
      (successfulTransactions.length / eligibleTransactions.length) *
      100
    ).toFixed(1)}%`,
  );
  console.log("=================================\n");

  console.log("✅ RecoverAI seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
