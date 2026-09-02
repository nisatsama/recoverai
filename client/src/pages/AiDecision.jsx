import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const getActionStyles = (action) => {
  switch (action) {
    case "RETRY":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "SEND_REMINDER":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "ESCALATE":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "STOP":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getPolicyStatus = (decision) => {
  // Temporary frontend logic.
  // Replace this with real policyDecision from backend later.
  if (
    decision.recommendedAction === "RETRY" &&
    decision.transaction?.failureReason === "Insufficient Funds"
  ) {
    return "BLOCKED";
  }

  return "APPROVED";
};

const DecisionCard = ({ decision, onView }) => {
  const transaction = decision.transaction;

  const policyStatus = getPolicyStatus(decision);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-gray-900">
              {transaction?.id || decision.transactionId}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                policyStatus === "APPROVED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {policyStatus === "APPROVED" ? "✓ APPROVED" : "✕ BLOCKED"}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {transaction?.paymentMethod || "Payment"}{" "}
            <span className="mx-1">•</span>{" "}
            {transaction?.failureReason || "Payment failure"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatAmount(transaction?.amount, transaction?.currency)}
          </p>
        </div>
      </div>

      {/* Decision information */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>🤖</span>
            Diagnosis
          </div>

          <p className="mt-2 font-medium text-gray-900">
            {decision.failureCategory}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>🎯</span>
            Recommendation
          </div>

          <span
            className={`mt-2 inline-flex rounded-lg border px-3 py-1.5 text-sm font-bold ${getActionStyles(
              decision.recommendedAction,
            )}`}
          >
            {decision.recommendedAction.replaceAll("_", " ")}
          </span>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>📊</span>
            Confidence
          </div>

          <p className="mt-2 font-bold text-gray-900">
            {formatPercent(decision.confidence)}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          AI Reasoning
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {decision.reason}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
        <div className="text-sm text-gray-500">
          Recovery probability:{" "}
          <span className="font-semibold text-gray-900">
            {formatPercent(decision.recoveryProbability)}
          </span>
        </div>

        <button
          onClick={() => onView(decision.transactionId)}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          View Decision →
        </button>
      </div>
    </div>
  );
};

const AIDecision = () => {
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get("api/decisions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDecisions(response.data.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load AI decisions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredDecisions = useMemo(() => {
    return decisions.filter((decision) => {
      const transaction = decision.transaction;

      const matchesSearch =
        transaction?.id?.toLowerCase().includes(search.toLowerCase()) ||
        transaction?.failureReason
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        decision.reason?.toLowerCase().includes(search.toLowerCase());

      const matchesAction =
        actionFilter === "ALL" || decision.recommendedAction === actionFilter;

      const policyStatus = getPolicyStatus(decision);

      const matchesStatus =
        statusFilter === "ALL" || policyStatus === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [decisions, search, actionFilter, statusFilter]);

  const stats = useMemo(() => {
    const approved = decisions.filter(
      (decision) => getPolicyStatus(decision) === "APPROVED",
    ).length;

    const revenueAtRisk = decisions.reduce((total, decision) => {
      return total + Number(decision.transaction?.amount || 0);
    }, 0);

    return {
      total: decisions.length,
      approved,
      approvalRate:
        decisions.length > 0
          ? ((approved / decisions.length) * 100).toFixed(1)
          : 0,
      revenueAtRisk,
    };
  }, [decisions]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">AI RECOVERY ENGINE</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          AI Decisions
        </h1>

        <p className="mt-2 text-gray-500">
          Review, understand and monitor AI recovery decisions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Decisions</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Policy Approved</p>

          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>

            <span className="mb-1 text-sm font-medium text-emerald-600">
              {stats.approvalRate}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Revenue at Risk</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{stats.revenueAtRisk.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />
          </div>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="RETRY">Retry</option>
            <option value="SEND_REMINDER">Send Reminder</option>
            <option value="ESCALATE">Escalate</option>
            <option value="STOP">Stop</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Queue */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              AI Decision Queue
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredDecisions.length} decisions
            </p>
          </div>

          <button
            onClick={fetchDecisions}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

            <p className="mt-4 text-sm text-gray-500">
              Loading AI decisions...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">{error}</p>

            <button
              onClick={fetchDecisions}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredDecisions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-4xl">🤖</div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No AI decisions found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or analyze a failed transaction.
            </p>
          </div>
        )}

        {/* Decisions */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onView={(transactionId) =>
                  navigate(`/ai-decisions/${transactionId}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDecision;
