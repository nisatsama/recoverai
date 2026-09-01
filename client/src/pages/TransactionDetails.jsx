import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

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

    default:
      return {
        label: status || "Unknown",
        icon: "●",
        style: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
  }
};

export default function TransactionsDetails({ transactionId, onClose }) {
  const [transaction, setTransaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH TRANSACTION DETAILS
  // --------------------------------------------------

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

        if (!response.ok) {
          throw new Error("Transaction not found");
        }

        const data = await response.json();

        setTransaction(data.transaction || data);
      } catch (err) {
        console.error(err);

        setError(err.message || "Unable to load transaction");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  // --------------------------------------------------
  // ESC TO CLOSE
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  return (
    <>
      {/* BACKDROP */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
      />

      {/* DRAWER */}

      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-slate-800 bg-[#0a0e16] shadow-2xl">
        {/* ==================================================
            HEADER
        ================================================== */}

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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

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
            <TransactionContent transaction={transaction} />
          )}
        </div>
      </aside>
    </>
  );
}

/* ======================================================
   TRANSACTION CONTENT
====================================================== */

function TransactionContent({ transaction: tx }) {
  const status = getStatus(tx.status);

  const retryCount = tx.retryCount ?? tx.execution?.retryCount ?? 0;

  const maxRetries = tx.maxRetries ?? tx.execution?.maxRetries ?? 3;

  const confidence = tx.confidence ?? tx.aiDecision?.confidence ?? 0;

  const aiDiagnosis =
    tx.aiDiagnosis || tx.aiDecision?.diagnosis || "No AI diagnosis available.";

  const recommendedAction = tx.aiAction || tx.aiDecision?.action || "No action";

  const policyApproved = tx.policyApproved ?? tx.policy?.approved ?? false;

  const cooldownSatisfied =
    tx.cooldownSatisfied ?? tx.policy?.cooldownSatisfied ?? false;

  const riskFlag = tx.riskFlag ?? tx.policy?.riskFlag ?? false;

  const execution = tx.execution || null;

  const recoveredAmount = tx.recoveredAmount ?? execution?.recoveredAmount ?? 0;

  return (
    <div className="p-6">
      {/* ==================================================
          TRANSACTION ID + STATUS
      ================================================== */}

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
      </div>

      {/* ==================================================
          AMOUNT + PAYMENT METHOD
      ================================================== */}

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

      {/* ==================================================
          FAILURE
      ================================================== */}

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

      {/* ==================================================
          AI DIAGNOSIS
      ================================================== */}

      <DetailSection title="AI DIAGNOSIS">
        <p className="text-sm leading-6 text-slate-300">{aiDiagnosis}</p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Confidence
          </span>

          <span className="text-lg font-semibold text-indigo-400">
            {confidence}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${Math.min(confidence, 100)}%`,
            }}
          />
        </div>
      </DetailSection>

      <Divider />

      {/* ==================================================
          RECOMMENDED ACTION
      ================================================== */}

      <DetailSection title="RECOMMENDED ACTION">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-xl text-indigo-400">
              {recommendedAction?.toUpperCase().includes("RETRY") ? "↻" : "⚡"}
            </div>

            <div>
              <p className="text-xs text-slate-500">AI Decision</p>

              <p className="mt-1 font-medium text-white">
                {formatAction(recommendedAction)}
              </p>
            </div>
          </div>
        </div>
      </DetailSection>

      <Divider />

      {/* ==================================================
          POLICY CHECK
      ================================================== */}

      <DetailSection title="POLICY CHECK">
        <div className="space-y-3">
          <PolicyRow
            passed={tx.failureReason && !riskFlag}
            text={
              tx.failureReason
                ? `${tx.failureReason}`
                : "Failure reason available"
            }
          />

          <PolicyRow
            passed={retryCount < maxRetries}
            text={`Retry count: ${retryCount} / ${maxRetries}`}
          />

          <PolicyRow passed={cooldownSatisfied} text="Cooldown satisfied" />

          <PolicyRow passed={!riskFlag} text="No risk flags" />
        </div>

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
      </DetailSection>

      <Divider />

      {/* ==================================================
          EXECUTION
      ================================================== */}

      <DetailSection title="EXECUTION">
        {execution ? (
          <div className="relative">
            {/* TIMELINE */}

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
                    {execution.action || `Retry #${retryCount}`}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Recovery action executed
                  </p>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-medium text-emerald-400">
                    {execution.result || "Payment Successful"}
                  </p>

                  {execution.timestamp && (
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(execution.timestamp).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RECOVERED AMOUNT */}

            {recoveredAmount > 0 && (
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
          </div>
        )}
      </DetailSection>

      <Divider />

      {/* ==================================================
          CUSTOMER
      ================================================== */}

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

      {/* ==================================================
          AUDIT BUTTON
      ================================================== */}

      <button
        onClick={() => {
          // Change this to your audit route if needed.
          window.location.href = `/audit?transaction=${encodeURIComponent(
            tx.transactionId || tx.id,
          )}`;
        }}
        className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white"
      >
        View Audit Trail →
      </button>
    </div>
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
   DIVIDER
====================================================== */

function Divider() {
  return <div className="border-t border-slate-800" />;
}

/* ======================================================
   ACTION FORMATTER
====================================================== */

function formatAction(action) {
  if (!action) return "No action";

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

    case "BLOCK":
      return "🚫 Block Transaction";

    default:
      return action;
  }
}
