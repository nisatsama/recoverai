import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:3000";

function Home() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MOCK DATA ---------------- */

  const summary = analytics?.summary || {
    totalTransactions: 12480,
    transactionsAtRisk: 842,
    recoveredTransactions: 624,
    failedTransactions: 218,
    totalRevenueAtRisk: 184250,
    recoveredRevenue: 126400,
    recoveryRate: 73.5,
  };

  const riskDistribution = analytics?.riskDistribution || [
    {
      name: "High Risk",
      value: 218,
    },
    {
      name: "Medium Risk",
      value: 374,
    },
    {
      name: "Low Risk",
      value: 250,
    },
  ];

  const transactionTrend = analytics?.transactionTrend || [
    { date: "Aug 25", atRisk: 92, recovered: 61 },
    { date: "Aug 26", atRisk: 115, recovered: 74 },
    { date: "Aug 27", atRisk: 102, recovered: 81 },
    { date: "Aug 28", atRisk: 138, recovered: 96 },
    { date: "Aug 29", atRisk: 121, recovered: 88 },
    { date: "Aug 30", atRisk: 146, recovered: 105 },
    { date: "Aug 31", atRisk: 128, recovered: 119 },
  ];

  const recentTransactions = analytics?.recentTransactions || [
    {
      id: "TXN-10482",
      customer: "Rahul Sharma",
      amount: 12500,
      reason: "Insufficient funds",
      risk: "High",
      status: "Pending",
    },
    {
      id: "TXN-10481",
      customer: "Priya Singh",
      amount: 8400,
      reason: "Bank declined",
      risk: "Medium",
      status: "Recovery Sent",
    },
    {
      id: "TXN-10480",
      customer: "Arjun Mehta",
      amount: 15200,
      reason: "Card expired",
      risk: "High",
      status: "Recovered",
    },
    {
      id: "TXN-10479",
      customer: "Sneha Das",
      amount: 4300,
      reason: "Network failure",
      risk: "Low",
      status: "Recovered",
    },
    {
      id: "TXN-10478",
      customer: "Aman Gupta",
      amount: 9800,
      reason: "Payment timeout",
      risk: "Medium",
      status: "Pending",
    },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

  /* ---------------- HELPERS ---------------- */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskStyle = (risk) => {
    if (risk === "High") {
      return "bg-red-100 text-red-700";
    }

    if (risk === "Medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (risk === "Low") {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getStatusStyle = (status) => {
    if (status === "Recovered") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Recovery Sent") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        {/* IMPORTANT: Leave space for fixed sidebar */}
        <main className="ml-[276px] min-h-screen p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-64"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-32 bg-gray-200 rounded-2xl" />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="xl:col-span-2 h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT
          ml-[276px] prevents content from going underneath Sidebar
      */}
      <main className="ml-[276px] min-h-screen w-[calc(100%-276px)] overflow-x-hidden">
        <div className="p-6 lg:p-8">
          {/* ================= HEADER ================= */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Overview</h1>

              <p className="text-gray-500 mt-1">
                Monitor your revenue recovery performance.
              </p>
            </div>
          </div>

          {/* ================= KPI CARDS ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {/* TOTAL TRANSACTIONS */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {summary.totalTransactions.toLocaleString("en-IN")}
                  </h2>

                  <p className="text-xs text-green-600 mt-4">
                    ↑ 12.4% from last week
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-600 text-xl">▣</span>
                </div>
              </div>
            </div>

            {/* AT RISK */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Transactions At Risk</p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {summary.transactionsAtRisk.toLocaleString("en-IN")}
                  </h2>

                  <p className="text-xs text-red-600 mt-4">
                    {formatCurrency(summary.totalRevenueAtRisk)} revenue at risk
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠</span>
                </div>
              </div>
            </div>

            {/* RECOVERED */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Recovered</p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {summary.recoveredTransactions.toLocaleString("en-IN")}
                  </h2>

                  <p className="text-xs text-green-600 mt-4">
                    {formatCurrency(summary.recoveredRevenue)} recovered
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
              </div>
            </div>

            {/* RECOVERY RATE */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Recovery Rate</p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {summary.recoveryRate}%
                  </h2>

                  <p className="text-xs text-purple-600 mt-4">
                    Successful recovery performance
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <span className="text-purple-600 text-xl">↗</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CHARTS ================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* PIE CHART */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-w-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Risk Distribution
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Transactions currently at risk
                </p>
              </div>

              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend verticalAlign="bottom" height={40} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINE CHART */}

            <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-w-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recovery Trend
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  At-risk vs recovered transactions
                </p>
              </div>

              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={transactionTrend}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />

                    <YAxis tick={{ fontSize: 12 }} />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="atRisk"
                      name="At Risk"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="recovered"
                      name="Recovered"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ================= REVENUE CARDS ================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Revenue At Risk</p>

              <h3 className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(summary.totalRevenueAtRisk)}
              </h3>

              <p className="text-xs text-gray-400 mt-2">
                Revenue requiring recovery action
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Revenue Recovered</p>

              <h3 className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(summary.recoveredRevenue)}
              </h3>

              <p className="text-xs text-gray-400 mt-2">
                Successfully recovered revenue
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Failed Transactions</p>

              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {summary.failedTransactions.toLocaleString("en-IN")}
              </h3>

              <p className="text-xs text-gray-400 mt-2">
                Transactions requiring attention
              </p>
            </div>
          </div>

          {/* ================= RECENT TRANSACTIONS ================= */}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Latest transactions requiring monitoring or recovery.
                  </p>
                </div>

                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all transactions →
                </button>
              </div>
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Transaction
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Customer
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Amount
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Failure Reason
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Risk
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {transaction.id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {transaction.customer}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {transaction.reason}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskStyle(
                            transaction.risk,
                          )}`}
                        >
                          {transaction.risk}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="md:hidden divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {transaction.id}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskStyle(
                        transaction.risk,
                      )}`}
                    >
                      {transaction.risk}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {transaction.customer}
                  </p>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>

                    <span className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reason</span>

                    <span className="text-gray-700">{transaction.reason}</span>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      transaction.status,
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
