import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatAmount = (amount, currency = "INR") => {
  if (currency === "INR") {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }

  return `${currency} ${Number(amount).toLocaleString()}`;
};

const formatPercent = (value) => {
  return `${Math.round(Number(value) * 100)}%`;
};

/*
|--------------------------------------------------------------------------
| Reusable components
|--------------------------------------------------------------------------
*/

const Section = ({ title, subtitle, children }) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="font-bold text-gray-900">{title}</h2>

        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
};

const ConfidenceBar = ({ value }) => {
  const percentage = Math.round(Number(value) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">Recovery confidence</span>

        <span className="font-bold text-gray-900">{percentage}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PolicyCheck = ({ passed, children }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {passed ? "✓" : "✕"}
      </div>

      <span
        className={`text-sm ${
          passed ? "text-gray-700" : "font-medium text-red-700"
        }`}
      >
        {children}
      </span>
    </div>
  );
};

const ChainNode = ({ icon, title, subtitle, status = "default" }) => {
  const statusStyles = {
    default: "border-gray-200 bg-white",
    success: "border-emerald-200 bg-emerald-50",
    blocked: "border-red-200 bg-red-50",
    ai: "border-purple-200 bg-purple-50",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${statusStyles[status]}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          {icon}
        </div>

        <div>
          <p className="font-bold text-gray-900">{title}</p>

          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const Connector = () => {
  return (
    <div className="flex justify-center py-2">
      <div className="flex flex-col items-center">
        <div className="h-6 w-px bg-gray-300" />

        <span className="text-gray-400">↓</span>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/

const AIDecisionDetails = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDecision();
  }, [transactionId]);

  const fetchDecision = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/ai/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDecision(response.data.data);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load AI decision.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading decision chain...
          </p>
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => navigate("/ai-decisions")}
          className="mb-6 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          ← Back to AI Decisions
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h2 className="font-bold text-red-800">Unable to load decision</h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /*
   * IMPORTANT:
   *
   * Your current API doesn't return transaction, policy or execution
   * information from getAIDecision().
   *
   * These are temporary values for the UX.
   * Connect them to your Policy Engine / Recovery Execution APIs later.
   */

  const transaction = {
    id: decision.transactionId,
    amount: 4999,
    currency: "INR",
    paymentMethod: "UPI",
    failureReason: "Bank Timeout",
    status: "FAILED",
  };

  const isBlocked =
    decision.recommendedAction === "RETRY" &&
    transaction.failureReason === "Insufficient Funds";

  const policyAllowed = !isBlocked;

  const executionSuccessful =
    policyAllowed && decision.recommendedAction === "RETRY";

  const retryCount = 0;
  const retryLimit = 3;

  const auditEvents = [
    {
      time: "18:01:02",
      event: "Payment failed",
      type: "transaction",
    },
    {
      time: "18:01:03",
      event: "AI diagnosis generated",
      type: "ai",
    },
    {
      time: "18:01:03",
      event: `Recovery recommendation: ${decision.recommendedAction}`,
      type: "ai",
    },
    {
      time: "18:01:03",
      event: policyAllowed
        ? "Policy approved"
        : "Policy blocked recovery action",
      type: "policy",
    },
    ...(policyAllowed
      ? [
          {
            time: "18:01:04",
            event: "Recovery action executed",
            type: "execution",
          },
          {
            time: "18:01:05",
            event: executionSuccessful
              ? "Payment successful"
              : "Recovery action completed",
            type: "execution",
          },
          {
            time: "18:01:05",
            event: executionSuccessful
              ? `${formatAmount(transaction.amount)} recovered`
              : "Recovery outcome recorded",
            type: "success",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() => navigate("/ai-decisions")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
      >
        ← Back to AI Decisions
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-sm font-semibold text-gray-400">
              {transaction.id}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              AI Recovery Decision
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="text-xl font-bold text-gray-900">
                {formatAmount(transaction.amount, transaction.currency)}
              </span>

              <span>•</span>

              <span>{transaction.paymentMethod}</span>

              <span>•</span>

              <span>{transaction.failureReason}</span>

              <span>•</span>

              <span className="font-semibold text-red-600">
                {transaction.status}
              </span>
            </div>
          </div>

          <div
            className={`rounded-xl border px-4 py-2 text-sm font-bold ${
              policyAllowed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {policyAllowed ? "✓ POLICY APPROVED" : "✕ POLICY BLOCKED"}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ============================================================
            AI ANALYSIS + RECOVERY DECISION
        ============================================================ */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* AI Analysis */}
          <Section
            title="AI Analysis"
            subtitle="What the AI understood about this failure"
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Failure Category
                </p>

                <p className="mt-2 text-lg font-bold text-gray-900">
                  {decision.failureCategory}
                </p>
              </div>

              <ConfidenceBar value={decision.confidence} />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Reason
                </p>

                <p className="mt-2 leading-7 text-gray-600">
                  {decision.reason}
                </p>
              </div>
            </div>
          </Section>

          {/* Recovery Decision */}
          <Section
            title="Recovery Decision"
            subtitle="What the AI recommends — not what it is allowed to execute"
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Recommended Action
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-3xl text-white">
                    {decision.recommendedAction === "RETRY"
                      ? "↻"
                      : decision.recommendedAction === "SEND_REMINDER"
                        ? "✉"
                        : "⚡"}
                  </div>

                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {decision.recommendedAction.replaceAll("_", " ")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      AI confidence{" "}
                      <span className="font-bold text-gray-900">
                        {formatPercent(decision.confidence)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Recovery Probability</span>

                  <span className="font-bold text-gray-900">
                    {formatPercent(decision.recoveryProbability)}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gray-900"
                    style={{
                      width: `${Number(decision.recoveryProbability) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* ============================================================
            DECISION CHAIN
        ============================================================ */}

        <Section
          title="Decision Chain"
          subtitle="AI recommends. Policy decides. Execution follows."
        >
          <div className="mx-auto max-w-2xl">
            <ChainNode
              icon="🤖"
              title="AI Analysis"
              subtitle={`Detected ${decision.failureCategory}`}
              status="ai"
            />

            <Connector />

            <ChainNode
              icon="🎯"
              title="Recommendation"
              subtitle={`AI recommends ${decision.recommendedAction.replaceAll(
                "_",
                " ",
              )}`}
            />

            <Connector />

            <ChainNode
              icon="🛡"
              title="Policy Engine"
              subtitle={
                policyAllowed
                  ? "Recovery action is within merchant policy"
                  : "Recovery action violates merchant policy"
              }
              status={policyAllowed ? "success" : "blocked"}
            />

            <Connector />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ChainNode
                icon={policyAllowed ? "⚡" : "⛔"}
                title={policyAllowed ? "EXECUTE" : "STOP"}
                subtitle={
                  policyAllowed
                    ? "Policy authorized the action"
                    : "Action blocked before execution"
                }
                status={policyAllowed ? "success" : "blocked"}
              />

              <ChainNode
                icon={executionSuccessful ? "✓" : "—"}
                title={executionSuccessful ? "RECOVERED" : "NO EXECUTION"}
                subtitle={
                  executionSuccessful
                    ? `${formatAmount(transaction.amount)} recovered`
                    : "No payment action was executed"
                }
                status={executionSuccessful ? "success" : "blocked"}
              />
            </div>
          </div>
        </Section>

        {/* ============================================================
            POLICY EVALUATION
        ============================================================ */}

        <Section
          title="🛡 Policy Evaluation"
          subtitle="Deterministic rules applied after AI recommendation"
        >
          <div className="space-y-4">
            <PolicyCheck passed={true}>Temporary failure detected</PolicyCheck>

            <PolicyCheck passed={retryCount < retryLimit}>
              Retry count: {retryCount} / {retryLimit}
            </PolicyCheck>

            <PolicyCheck passed={true}>Cooldown satisfied</PolicyCheck>

            <PolicyCheck passed={true}>Transaction eligible</PolicyCheck>

            <PolicyCheck passed={true}>No risk flags</PolicyCheck>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Final Policy Decision
              </p>

              <p className="mt-1 text-sm text-gray-500">
                AI recommendation has been validated against merchant rules.
              </p>
            </div>

            <div
              className={`rounded-xl px-5 py-3 text-sm font-bold ${
                policyAllowed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {policyAllowed ? "✓ ALLOWED" : "✕ BLOCKED"}
            </div>
          </div>
        </Section>

        {/* ============================================================
            EXECUTION
        ============================================================ */}

        <Section
          title="Execution"
          subtitle="What actually happened after policy evaluation"
        >
          <div className="mx-auto max-w-xl">
            <ChainNode
              icon="🎯"
              title="AI Recommendation"
              subtitle={decision.recommendedAction}
            />

            <Connector />

            <ChainNode
              icon="🛡"
              title="Policy Check"
              subtitle={policyAllowed ? "Approved" : "Blocked"}
              status={policyAllowed ? "success" : "blocked"}
            />

            <Connector />

            {policyAllowed ? (
              <>
                <ChainNode
                  icon="↻"
                  title="Retry #1"
                  subtitle="Payment retry executed"
                />

                <Connector />

                <ChainNode
                  icon="✓"
                  title="Payment Successful"
                  subtitle="Payment provider confirmed success"
                  status="success"
                />

                <Connector />

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Revenue Recovered
                  </p>

                  <p className="mt-2 text-3xl font-black text-emerald-700">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Connector />

                <ChainNode
                  icon="⛔"
                  title="Execution Stopped"
                  subtitle="Policy engine prevented the recovery action"
                  status="blocked"
                />
              </>
            )}
          </div>
        </Section>

        {/* ============================================================
            AUDIT TRAIL
        ============================================================ */}

        <Section
          title="Audit Trail"
          subtitle="Immutable sequence of events for this decision"
        >
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gray-200" />

            <div className="space-y-6">
              {auditEvents.map((event, index) => {
                const icon =
                  event.type === "ai"
                    ? "🤖"
                    : event.type === "policy"
                      ? "🛡"
                      : event.type === "execution"
                        ? "⚡"
                        : event.type === "success"
                          ? "✓"
                          : "•";

                return (
                  <div key={index} className="relative flex items-start gap-5">
                    <div
                      className={`relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                        event.type === "success"
                          ? "bg-emerald-500"
                          : event.type === "policy"
                            ? "bg-purple-500"
                            : event.type === "ai"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                      }`}
                    />

                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>

                        <span className="text-sm font-medium text-gray-800">
                          {event.event}
                        </span>
                      </div>

                      <span className="font-mono text-xs text-gray-400">
                        {event.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ============================================================
            EXPLANATION
        ============================================================ */}

        <div className="rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>

            <div>
              <h3 className="font-bold">Why this decision was safe</h3>

              <p className="mt-2 text-sm leading-6 text-gray-300">
                RecoverAI's AI model only recommends a recovery strategy. The
                recommendation is passed through a deterministic policy engine
                before any payment action can occur. This prevents the AI from
                having unrestricted authority over merchant funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDecisionDetails;
