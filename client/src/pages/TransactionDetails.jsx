import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ======================================================
   CURRENCY FORMATTER
====================================================== */

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

/* ======================================================
   STATUS
====================================================== */

const getStatus = (status) => {
  switch (status?.toUpperCase()) {
    case "RECOVERED":
      return {
        label: "Recovered",
        icon: "✓",
        style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };

    case "BLOCKED":
      return {
        label: "Blocked",
        icon: "✕",
        style: "bg-red-500/10 text-red-400 border-red-500/20",
      };

    case "RECOVERING":
      return {
        label: "Recovering",
        icon: "↻",
        style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };

    case "PENDING":
      return {
        label: "Pending",
        icon: "⏳",
        style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };

    case "FAILED":
      return {
        label: "Failed",
        icon: "✕",
        style: "bg-red-500/10 text-red-400 border-red-500/20",
      };

    default:
      return {
        label: status || "Unknown",
        icon: "●",
        style: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
  }
};

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function TransactionDetails({ transactionId, onClose }) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transactionId) return;

    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Transaction not found");
        }

        setTransaction(data.transaction || data);
      } catch (err) {
        console.error("Transaction fetch error:", err);
        setError(err.message || "Unable to load transaction");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
      />

      {/* DRAWER */}
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-slate-800 bg-[#0a0e16] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Transaction Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Recovery decision and execution
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close transaction details"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="space-y-6 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-40 rounded bg-slate-800" />
                <div className="h-10 w-32 rounded bg-slate-800" />
                <div className="h-24 rounded bg-slate-800" />
                <div className="h-40 rounded bg-slate-800" />
                <div className="h-40 rounded bg-slate-800" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="font-medium text-red-400">
                  Failed to load transaction
                </p>

                <p className="mt-2 text-sm text-slate-400">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && transaction && (
            <TransactionContent
              transaction={transaction}
              onTransactionUpdate={setTransaction}
            />
          )}
        </div>
      </aside>
    </>
  );
}

/* ======================================================
   TRANSACTION CONTENT
====================================================== */

function TransactionContent({ transaction: tx, onTransactionUpdate }) {
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState("");

  const [aiDecision, setAiDecision] = useState(tx.aiDecision || null);

  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionError, setExecutionError] = useState("");
  const [executionSuccess, setExecutionSuccess] = useState("");

  /* ==================================================
     GET AI DECISION
  ================================================== */

  const getAIDecision = async () => {
    try {
      setDecisionLoading(true);
      setDecisionError("");
      setExecutionError("");
      setExecutionSuccess("");

      const token = localStorage.getItem("token");

      const transactionDatabaseId = tx.id;

      if (!transactionDatabaseId) {
        throw new Error("Transaction database ID is missing");
      }

      const response = await fetch(
        `${API_URL}/api/ai/transactions/${transactionDatabaseId}/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        const decision = data.data || data.aiDecision || data;

        const policyResponse = await evaluatePolicy(decision.recommendedAction);
        const policyDecision = policyResponse.data || policyResponse;

        setAiDecision(decision);

        onTransactionUpdate?.({
          ...tx,
          aiDecision: decision,
          policy: policyDecision,
          policyApproved: policyDecision.allowed,
          policyReason: policyDecision.reason,
        });

        return;
      }

      if (response.status === 409 && data.data) {
        const policyResponse = await evaluatePolicy(
          data.data.recommendedAction,
        );
        const policyDecision = policyResponse.data || policyResponse;

        setAiDecision(data.data);

        onTransactionUpdate?.({
          ...tx,
          aiDecision: data.data,
          policy: policyDecision,
          policyApproved: policyDecision.allowed,
          policyReason: policyDecision.reason,
        });

        return;
      }

      throw new Error(data.message || "Failed to get AI decision");
    } catch (error) {
      console.error("Get AI Decision Error:", error);
      setDecisionError(error.message || "Failed to generate AI decision");
    } finally {
      setDecisionLoading(false);
    }
  };

  const evaluatePolicy = async (requestedAction) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/policy/transactions/${tx.id}/evaluate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestedAction }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to evaluate recovery policy");
    }

    return data;
  };

  /* ==================================================
     EXECUTE RECOVERY

     IMPORTANT:
     The backend remains responsible for:
     - validating the transaction
     - applying policy
     - executing the allowed recovery action

     The frontend only requests execution.
  ================================================== */

  const executeRecovery = async () => {
    try {
      setExecutionLoading(true);
      setExecutionError("");
      setExecutionSuccess("");

      const token = localStorage.getItem("token");

      if (!tx.id) {
        throw new Error("Transaction database ID is missing");
      }

      if (!aiDecision) {
        throw new Error("Generate an AI decision before executing recovery");
      }

      if (!policyApproved) {
        throw new Error(
          "Recovery cannot be executed because the policy rejected this transaction",
        );
      }

      /*
       * Primary endpoint expected by the RecoverAI architecture:
       *
       * POST /api/recovery/:transactionId
       *
       * If your recovery route uses a different path, change ONLY
       * the URL below.
       */

      const response = await fetch(
        `${API_URL}/api/recovery/transactions/${tx.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Recovery execution failed");
      }

      const updatedTransaction =
        data.transaction || data.data?.transaction || data.data || null;

      if (updatedTransaction) {
        onTransactionUpdate?.(updatedTransaction);

        if (updatedTransaction.aiDecision) {
          setAiDecision(updatedTransaction.aiDecision);
        }
      }

      setExecutionSuccess(
        data.message || "Recovery action executed successfully.",
      );
    } catch (error) {
      console.error("Execute Recovery Error:", error);
      setExecutionError(error.message || "Failed to execute recovery");
    } finally {
      setExecutionLoading(false);
    }
  };

  /* ==================================================
     AI VALUES
  ================================================== */

  const confidenceScore = aiDecision?.confidence ?? tx.confidence ?? 0;

  const confidencePercentage = normalizePercentage(confidenceScore);

  const recoveryScore =
    aiDecision?.recoveryProbability ?? tx.recoveryProbability ?? 0;

  const recoveryPercentage = normalizePercentage(recoveryScore);

  const aiDiagnosis =
    aiDecision?.reason ||
    aiDecision?.diagnosis ||
    tx.aiDiagnosis ||
    "No AI diagnosis available.";

  const failureCategory =
    aiDecision?.failureCategory || tx.failureCategory || "—";

  const recommendedAction =
    aiDecision?.recommendedAction ||
    tx.recommendedAction ||
    tx.aiAction ||
    "NO_ACTION";

  const decisionSource =
    aiDecision?.source ||
    aiDecision?.decisionSource ||
    tx.aiDecisionSource ||
    "AI";

  /* ==================================================
     OTHER VALUES
  ================================================== */

  const status = getStatus(tx.status);

  const retryCount = tx.retryCount ?? tx.execution?.retryCount ?? 0;

  const maxRetries = tx.maxRetries ?? tx.execution?.maxRetries ?? 3;

  /*
   * The backend policy result is authoritative.
   * These values are displayed only.
   */

  const latestPolicyDecision =
    tx.policy ??
    tx.policyDecision ??
    [...(tx.policyDecisions || [])].sort(
      (first, second) =>
        new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
    )[0] ??
    null;

  const policyApproved =
    tx.policyApproved ??
    latestPolicyDecision?.allowed ??
    aiDecision?.policyApproved ??
    false;

  const cooldownSatisfied =
    tx.cooldownSatisfied ??
    tx.policy?.cooldownSatisfied ??
    aiDecision?.cooldownSatisfied ??
    false;

  const riskFlag =
    tx.riskFlag ?? tx.policy?.riskFlag ?? aiDecision?.riskFlag ?? false;

  const policyChecks = tx.policy?.checks || aiDecision?.policy?.checks || null;

  const policyReason =
    tx.policyReason ||
    latestPolicyDecision?.reason ||
    aiDecision?.policy?.reason ||
    "";

  const execution = tx.execution || null;

  const recoveredAmount = tx.recoveredAmount ?? execution?.recoveredAmount ?? 0;

  const isFailed = tx.status?.toUpperCase() === "FAILED";

  const hasExecution =
    Boolean(execution) ||
    ["RECOVERED", "RECOVERING"].includes(tx.status?.toUpperCase());

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="p-6">
      {/* TRANSACTION ID + STATUS */}

      <div className="mb-7">
        <p className="font-mono text-sm text-indigo-400">
          {tx.transactionId || tx.id}
        </p>

        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${status.style}`}
          >
            <span>{status.icon}</span>
            {status.label}
          </span>
        </div>

        {(tx.createdAt || tx.updatedAt) && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {tx.createdAt && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">
                  Created
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(tx.createdAt)}
                </p>
              </div>
            )}

            {tx.updatedAt && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">
                  Updated
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(tx.updatedAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AMOUNT + PAYMENT METHOD */}

      <div className="mb-7 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Amount
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(tx.amount)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Payment Method
          </p>

          <p className="mt-3 inline-flex rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300">
            {tx.paymentMethod || "—"}
          </p>
        </div>
      </div>

      <Divider />

      {/* FAILURE */}

      <DetailSection title="FAILURE">
        <p className="text-base font-medium text-white">
          {tx.failureReason || "Unknown failure"}
        </p>

        {tx.failureCode && (
          <p className="mt-1 text-xs text-slate-500">
            Error code: {tx.failureCode}
          </p>
        )}
      </DetailSection>

      {/* GET AI DECISION */}

      <div className="mb-6">
        <button
          onClick={getAIDecision}
          disabled={decisionLoading || !isFailed || Boolean(aiDecision)}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {decisionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">◌</span>
              Analyzing Transaction...
            </span>
          ) : aiDecision ? (
            "✓ AI Decision Generated"
          ) : (
            "⚡ Get AI Decision"
          )}
        </button>

        {!isFailed && (
          <p className="mt-2 text-center text-xs text-slate-500">
            AI analysis is only available for failed transactions.
          </p>
        )}

        {decisionError && (
          <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{decisionError}</p>
          </div>
        )}
      </div>

      {/* AI DIAGNOSIS */}

      <DetailSection title="AI DIAGNOSIS">
        {!aiDecision ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-center">
            <p className="text-sm text-slate-400">
              No AI decision generated yet.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Click "Get AI Decision" to analyze this failed transaction.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Failure Category
              </p>

              <span className="mt-2 inline-flex rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400">
                {failureCategory}
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-300">{aiDiagnosis}</p>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Confidence
              </span>

              <span className="text-lg font-semibold text-indigo-400">
                {confidencePercentage}%
              </span>
            </div>

            <ProgressBar percentage={confidencePercentage} type="indigo" />

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Recovery Probability
              </span>

              <span className="text-lg font-semibold text-emerald-400">
                {recoveryPercentage}%
              </span>
            </div>

            <ProgressBar percentage={recoveryPercentage} type="emerald" />

            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Decision Source
              </span>

              <span
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  decisionSource.toString().toUpperCase() === "FALLBACK"
                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "border border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                }`}
              >
                {decisionSource.toString().toUpperCase() === "FALLBACK"
                  ? "⚙ FALLBACK RULES"
                  : "🤖 AI"}
              </span>
            </div>
          </>
        )}
      </DetailSection>

      <Divider />

      {/* RECOMMENDED ACTION */}

      <DetailSection title="RECOMMENDED ACTION">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-xl text-indigo-400">
              {getActionIcon(recommendedAction)}
            </div>

            <div>
              <p className="text-xs text-slate-500">AI Recommendation</p>

              <p className="mt-1 font-medium text-white">
                {formatAction(recommendedAction)}
              </p>
            </div>
          </div>
        </div>
      </DetailSection>

      <Divider />

      {/* POLICY CHECK */}

      <DetailSection title="POLICY CHECK">
        <div className="space-y-3">
          <PolicyRow
            passed={policyChecks?.failureReason ?? Boolean(tx.failureReason)}
            text="Failure reason available"
          />

          <PolicyRow
            passed={policyChecks?.maxRetries ?? retryCount < maxRetries}
            text={`Retry count: ${retryCount} / ${maxRetries}`}
          />

          <PolicyRow
            passed={policyChecks?.cooldown ?? cooldownSatisfied}
            text="Cooldown satisfied"
          />

          <PolicyRow
            passed={policyChecks?.risk ?? !riskFlag}
            text="No risk flags"
          />
        </div>

        {policyReason && (
          <p className="mt-4 text-xs leading-5 text-slate-500">
            {policyReason}
          </p>
        )}

        <div
          className={`mt-5 rounded-lg border p-3 text-center ${
            policyApproved
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Policy
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              policyApproved ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {policyApproved ? "✓ APPROVED" : "✕ REJECTED"}
          </p>
        </div>

        {/* EXECUTE RECOVERY */}

        {isFailed && aiDecision && (
          <div className="mt-4">
            <button
              onClick={executeRecovery}
              disabled={executionLoading || !policyApproved || hasExecution}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {executionLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">◌</span>
                  Executing Recovery...
                </span>
              ) : hasExecution ? (
                "✓ Recovery Already Executed"
              ) : policyApproved ? (
                `⚡ Execute ${formatAction(recommendedAction)}`
              ) : (
                "Recovery Blocked by Policy"
              )}
            </button>

            {!policyApproved && (
              <p className="mt-2 text-center text-xs text-red-400/70">
                The deterministic policy engine rejected this recovery action.
              </p>
            )}
          </div>
        )}

        {executionError && (
          <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{executionError}</p>
          </div>
        )}

        {executionSuccess && (
          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-sm text-emerald-400">✓ {executionSuccess}</p>
          </div>
        )}
      </DetailSection>

      <Divider />

      {/* EXECUTION */}

      <DetailSection title="EXECUTION">
        {hasExecution ? (
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-sm text-indigo-400">
                  ↻
                </div>

                <div className="h-12 w-px bg-slate-800" />

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-400">
                  ✓
                </div>
              </div>

              <div className="flex-1">
                <div>
                  <p className="text-sm font-medium text-white">
                    {execution?.action || formatAction(recommendedAction)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Recovery action executed
                  </p>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-medium text-emerald-400">
                    {execution?.result ||
                      (tx.status?.toUpperCase() === "RECOVERED"
                        ? "Payment Successful"
                        : "Recovery in progress")}
                  </p>

                  {execution?.timestamp && (
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(execution.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {Number(recoveredAmount) > 0 && (
              <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-emerald-500/70">
                  Revenue Recovered
                </p>

                <p className="mt-2 text-2xl font-semibold text-emerald-400">
                  {formatCurrency(recoveredAmount)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-center">
            <p className="text-sm text-slate-400">No execution recorded yet.</p>

            <p className="mt-1 text-xs text-slate-600">
              Once policy approves the recovery, execute the recommended action
              above.
            </p>
          </div>
        )}
      </DetailSection>

      <Divider />

      {/* CUSTOMER */}

      {(tx.customer || tx.customerName) && (
        <DetailSection title="CUSTOMER">
          <p className="text-sm font-medium text-white">
            {tx.customer?.name || tx.customerName}
          </p>

          {(tx.customer?.email || tx.customerEmail) && (
            <p className="mt-1 text-sm text-slate-500">
              {tx.customer?.email || tx.customerEmail}
            </p>
          )}
        </DetailSection>
      )}

      <Divider />

      {/* AUDIT TRAIL */}

      <AuditTrail transaction={tx} />
    </div>
  );
}

/* ======================================================
   AUDIT TRAIL
====================================================== */

function AuditTrail({ transaction: tx }) {
  const auditEvents = tx.auditTrail || tx.auditLogs || tx.audit || [];

  if (!Array.isArray(auditEvents) || auditEvents.length === 0) {
    return (
      <DetailSection title="AUDIT TRAIL">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-center">
          <p className="text-sm text-slate-400">No audit events available.</p>
        </div>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="AUDIT TRAIL">
      <div className="relative space-y-4">
        {auditEvents.map((event, index) => (
          <div
            key={event.id || `${event.timestamp || event.createdAt}-${index}`}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-400">
                {index === auditEvents.length - 1 ? "•" : "✓"}
              </div>

              {index !== auditEvents.length - 1 && (
                <div className="mt-1 h-full min-h-8 w-px bg-slate-800" />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-2">
              <p className="text-sm font-medium text-white">
                {event.action ||
                  event.event ||
                  event.type ||
                  "Transaction event"}
              </p>

              {(event.message || event.description) && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {event.message || event.description}
                </p>
              )}

              {(event.timestamp || event.createdAt) && (
                <p className="mt-1 text-[11px] text-slate-600">
                  {formatDate(event.timestamp || event.createdAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}

/* ======================================================
   SECTION
====================================================== */

function DetailSection({ title, children }) {
  return (
    <section className="py-6">
      <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-slate-500">
        {title}
      </p>

      {children}
    </section>
  );
}

/* ======================================================
   POLICY ROW
====================================================== */

function PolicyRow({ passed, text }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
          passed
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {passed ? "✓" : "✕"}
      </div>

      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}

/* ======================================================
   PROGRESS BAR
====================================================== */

function ProgressBar({ percentage, type }) {
  const safePercentage = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  const fillClass = type === "emerald" ? "bg-emerald-500" : "bg-indigo-500";

  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
        style={{ width: `${safePercentage}%` }}
      />
    </div>
  );
}

/* ======================================================
   DIVIDER
====================================================== */

function Divider() {
  return <div className="border-t border-slate-800" />;
}

/* ======================================================
   ACTION ICON
====================================================== */

function getActionIcon(action) {
  const normalized = action?.toString().toUpperCase();

  switch (normalized) {
    case "RETRY":
    case "RETRY_PAYMENT":
      return "↻";

    case "SEND_REMINDER":
    case "REMIND":
      return "🔔";

    case "UPDATE_PAYMENT_METHOD":
    case "UPDATE":
      return "♻";

    case "ESCALATE":
      return "⚠";

    case "NO_ACTION":
      return "⏸";

    default:
      return "⚡";
  }
}

/* ======================================================
   ACTION FORMATTER
====================================================== */

function formatAction(action) {
  if (!action) {
    return "No action";
  }

  const normalized = action.toString().toUpperCase();

  switch (normalized) {
    case "RETRY":
    case "RETRY_PAYMENT":
      return "↻ Retry Payment";

    case "REMIND":
    case "SEND_REMINDER":
      return "🔔 Send Payment Reminder";

    case "UPDATE":
    case "UPDATE_PAYMENT_METHOD":
      return "♻ Update Payment Method";

    case "ESCALATE":
      return "⚠ Escalate for Review";

    case "NO_ACTION":
      return "⏸ No Action";

    default:
      return action;
  }
}

/* ======================================================
   HELPERS
====================================================== */

function normalizePercentage(value) {
  const number = Number(value) || 0;

  /*
   * Supports both:
   * 0.93 -> 93%
   * 93   -> 93%
   */
  const percentage = number > 1 ? number : number * 100;

  return Math.round(Math.min(Math.max(percentage, 0), 100));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
