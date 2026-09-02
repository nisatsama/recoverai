import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatNumber = (number = 0) => {
  return new Intl.NumberFormat("en-IN").format(Number(number));
};

const getPercentage = (value = 0) => {
  return `${Number(value).toFixed(1)}%`;
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/analytics/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setAnalytics(response.data.data);
      } else {
        setError("Failed to load analytics.");
      }
    } catch (err) {
      console.error("Analytics error:", err);

      setError(err.response?.data?.message || "Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-6 h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error State
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-700">
              Unable to load analytics
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={fetchAnalytics}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Normalize backend data
  // --------------------------------------------------

  const overview = analytics?.overview || analytics || {};

  const revenueAtRisk = overview.revenueAtRisk ?? overview.revenue_at_risk ?? 0;

  const recovered =
    overview.recovered ??
    overview.recoveredRevenue ??
    overview.recovered_revenue ??
    0;

  const recoveryRate = overview.recoveryRate ?? overview.recovery_rate ?? 0;

  const recoveryROI =
    overview.recoveryROI ?? overview.recoveryRoi ?? overview.recovery_roi ?? 0;

  const trend =
    analytics?.recoveryTrend ||
    analytics?.recovery_trend ||
    overview.recoveryTrend ||
    [];

  const outcomes =
    analytics?.recoveryOutcomes ||
    analytics?.recovery_outcomes ||
    overview.recoveryOutcomes ||
    [];

  const failureReasons =
    analytics?.failureReasons ||
    analytics?.failure_reasons ||
    overview.failureReasons ||
    [];

  const paymentMethods =
    analytics?.paymentMethods ||
    analytics?.payment_methods ||
    overview.paymentMethods ||
    [];

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-600">
                BUSINESS INTELLIGENCE
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Revenue recovery performance and transaction insights.
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Revenue At Risk */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Revenue at Risk
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {formatCurrency(revenueAtRisk)}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                ₹
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Total failed payment value
            </p>
          </div>

          {/* Recovered */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Recovered</p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {formatCurrency(recovered)}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>
            </div>

            <p className="mt-4 text-xs text-emerald-600">
              Revenue successfully recovered
            </p>
          </div>

          {/* Recovery Rate */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Recovery Rate
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {getPercentage(recoveryRate)}
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                %
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(Number(recoveryRate), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* ROI */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Recovery ROI
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {Number(recoveryROI).toFixed(1)}x
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                ↗
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Value recovered per unit of recovery cost
            </p>
          </div>
        </div>

        {/* =====================================================
            RECOVERY TREND
        ===================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Revenue Recovery Trend
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recovered revenue over time.
            </p>
          </div>

          {trend.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex h-64 min-w-[600px] items-end gap-4 border-b border-l border-slate-200 px-4 pb-0 pt-6">
                {trend.map((item, index) => {
                  const value = Number(
                    item.recovered ?? item.amount ?? item.value ?? 0,
                  );

                  const maxValue = Math.max(
                    ...trend.map((entry) =>
                      Number(
                        entry.recovered ?? entry.amount ?? entry.value ?? 0,
                      ),
                    ),
                    1,
                  );

                  const height = Math.max((value / maxValue) * 100, 4);

                  return (
                    <div
                      key={index}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="relative flex flex-1 items-end justify-center">
                        <div
                          className="w-full max-w-12 rounded-t-lg bg-blue-500 transition-all duration-300 group-hover:bg-blue-600"
                          style={{
                            height: `${height}%`,
                          }}
                        >
                          <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                            {formatCurrency(value)}
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-center text-xs font-medium text-slate-500">
                        {item.date ||
                          item.day ||
                          item.label ||
                          `Day ${index + 1}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50">
              <p className="text-sm text-slate-400">
                No recovery trend data available.
              </p>
            </div>
          )}
        </div>

        {/* =====================================================
            OUTCOMES + FAILURE REASONS
        ===================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recovery Outcomes */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Recovery Outcomes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                What happened after failed transactions.
              </p>
            </div>

            <div className="space-y-5">
              {outcomes.length > 0 ? (
                outcomes.map((item, index) => {
                  const label =
                    item.name ||
                    item.outcome ||
                    item.status ||
                    item.label ||
                    "Unknown";

                  const count = item.count ?? item.total ?? item.value ?? 0;

                  return (
                    <div key={index}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {label}
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {formatNumber(count)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${Math.min(Number(count) * 2, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">
                  No recovery outcome data available.
                </p>
              )}
            </div>
          </div>

          {/* Failure Reasons */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Failure Reasons
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Why transactions are failing.
              </p>
            </div>

            <div className="space-y-5">
              {failureReasons.length > 0 ? (
                failureReasons.map((item, index) => {
                  const label =
                    item.name || item.reason || item.label || "Unknown";

                  const percentage =
                    item.percentage ?? item.percent ?? item.value ?? 0;

                  return (
                    <div key={index}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {label}
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {getPercentage(percentage)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{
                            width: `${Math.min(Number(percentage), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">
                  No failure reason data available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            PAYMENT METHODS
        ===================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Recovery by Payment Method
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Revenue recovered across different payment methods.
            </p>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paymentMethods.map((item, index) => {
                const method =
                  item.name ||
                  item.method ||
                  item.paymentMethod ||
                  item.label ||
                  "Unknown";

                const amount = item.recovered ?? item.amount ?? item.value ?? 0;

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {method}
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {formatCurrency(amount)}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-600 shadow-sm">
                        {index + 1}
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-emerald-600">
                      Recovered revenue
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50">
              <p className="text-sm text-slate-400">
                No payment method data available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
