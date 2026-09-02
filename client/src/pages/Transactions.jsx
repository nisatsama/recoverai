import { useEffect, useMemo, useState } from "react";
import TransactionDetails from "./TransactionDetails";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getStatusStyle = (status) => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    case "PENDING":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";

    case "FAILED":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
};

const getActionLabel = (action) => {
  switch (action?.toUpperCase()) {
    case "RETRY":
      return "↻ Retry";

    case "REMIND":
      return "🔔 Remind";

    case "UPDATE":
      return "♻ Update";

    case "BLOCK":
      return "— None";

    default:
      return action || "—";
  }
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [failureFilter, setFailureFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  // --------------------------------------------------
  // FETCH TRANSACTIONS
  // --------------------------------------------------

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();

        // Supports either:
        // { transactions: [...] }
        // OR directly [...]
        const transactionData = Array.isArray(data)
          ? data
          : data.transactions || [];

        setTransactions(transactionData);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // --------------------------------------------------
  // FILTER OPTIONS
  // --------------------------------------------------

  const failureReasons = useMemo(() => {
    return [
      ...new Set(transactions.map((tx) => tx.failureReason).filter(Boolean)),
    ];
  }, [transactions]);

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(transactions.map((tx) => tx.paymentMethod).filter(Boolean)),
    ];
  }, [transactions]);

  // --------------------------------------------------
  // FILTER TRANSACTIONS
  // --------------------------------------------------

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        tx.id?.toLowerCase().includes(searchValue) ||
        tx.transactionId?.toLowerCase().includes(searchValue) ||
        tx.customer?.name?.toLowerCase().includes(searchValue) ||
        tx.customerName?.toLowerCase().includes(searchValue) ||
        tx.customerEmail?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || tx.status?.toUpperCase() === statusFilter;

      const matchesFailure =
        failureFilter === "ALL" || tx.failureReason === failureFilter;

      const matchesMethod =
        methodFilter === "ALL" || tx.paymentMethod === methodFilter;

      let matchesRisk = true;

      if (riskFilter === "HIGH") {
        matchesRisk = tx.riskFlag === true || tx.risk === "HIGH";
      }

      if (riskFilter === "LOW") {
        matchesRisk = tx.riskFlag !== true && tx.risk !== "HIGH";
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFailure &&
        matchesMethod &&
        matchesRisk
      );
    });
  }, [
    transactions,
    search,
    statusFilter,
    failureFilter,
    methodFilter,
    riskFilter,
  ]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // --------------------------------------------------
  // OVERVIEW STATS
  // --------------------------------------------------

  const totalTransactions = transactions.length;

  const revenueAtRisk = transactions
    .filter((tx) => tx.status?.toUpperCase() !== "RECOVERED")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const recoveredRevenue = transactions
    .filter((tx) => tx.status?.toUpperCase() === "RECOVERED")
    .reduce(
      (sum, tx) =>
        sum +
        Number(
          tx.recoveredAmount || tx.execution?.recoveredAmount || tx.amount || 0,
        ),
      0,
    );

  const recoveryRate =
    revenueAtRisk + recoveredRevenue > 0
      ? ((recoveredRevenue / (revenueAtRisk + recoveredRevenue)) * 100).toFixed(
          1,
        )
      : 0;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-full bg-[#080b12] text-white p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-slate-800" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 rounded-xl bg-slate-900" />
            ))}
          </div>

          <div className="h-16 rounded-xl bg-slate-900" />

          <div className="h-96 rounded-xl bg-slate-900" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-full bg-[#080b12] p-8 text-white">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <h2 className="text-lg font-semibold text-red-400">
            Failed to load transactions
          </h2>

          <p className="mt-2 text-sm text-slate-400">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full bg-[#080b12] text-white">
      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="p-6 lg:p-8">
        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Monitor failed payments and revenue recovery opportunities
            </p>
          </div>

          <select
            className="w-fit rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
            defaultValue="30"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={totalTransactions.toLocaleString("en-IN")}
          />

          <StatCard
            title="Revenue at Risk"
            value={formatCurrency(revenueAtRisk)}
            valueClass="text-orange-400"
          />

          <StatCard
            title="Recovered Revenue"
            value={formatCurrency(recoveredRevenue)}
            valueClass="text-emerald-400"
          />

          <StatCard
            title="Recovery Rate"
            value={`${recoveryRate}%`}
            valueClass="text-indigo-400"
          />
        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search transaction ID / customer"
              className="w-full rounded-xl border border-slate-800 bg-[#0d111a] py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500"
            />
          </div>
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-5 flex flex-wrap gap-3">
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={["ALL", "PENDING", "SUCCESS", "FAILED"]}
            label="Status"
          />

          <FilterSelect
            value={failureFilter}
            onChange={setFailureFilter}
            options={["ALL", ...failureReasons]}
            label="Failure Reason"
          />

          <FilterSelect
            value={methodFilter}
            onChange={setMethodFilter}
            options={["ALL", ...paymentMethods]}
            label="Payment Method"
          />

          <FilterSelect
            value={riskFilter}
            onChange={setRiskFilter}
            options={["ALL", "HIGH", "LOW"]}
            label="Risk"
          />
        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d111a]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-800 bg-[#101520]">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 font-medium">ID</th>

                  <th className="px-5 py-4 font-medium">Amount</th>

                  <th className="px-5 py-4 font-medium">Method</th>

                  <th className="px-5 py-4 font-medium">Failure</th>

                  <th className="px-5 py-4 font-medium">AI Action</th>

                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center">
                      <div className="text-3xl">🔍</div>

                      <p className="mt-3 text-sm text-slate-400">
                        No transactions found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <tr
                      key={tx.transactionId || tx.id}
                      onClick={() =>
                        setSelectedTransactionId(tx.transactionId || tx.id)
                      }
                      className="cursor-pointer transition hover:bg-slate-800/40"
                    >
                      {/* ID */}

                      <td className="px-5 py-4">
                        <button
                          className="font-mono text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();

                            setSelectedTransactionId(tx.transactionId || tx.id);
                          }}
                        >
                          {tx.transactionId || tx.id}
                        </button>

                        {(tx.customer?.name || tx.customerName) && (
                          <p className="mt-1 text-xs text-slate-500">
                            {tx.customer?.name || tx.customerName}
                          </p>
                        )}
                      </td>

                      {/* AMOUNT */}

                      <td className="px-5 py-4 text-sm font-medium">
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* METHOD */}

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {tx.paymentMethod || "—"}
                        </span>
                      </td>

                      {/* FAILURE */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-300">
                          {tx.failureReason || "—"}
                        </span>
                      </td>

                      {/* AI ACTION */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-indigo-400">
                          {getActionLabel(tx.aiAction)}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            tx.status,
                          )}`}
                        >
                          <span>
                            {tx.status?.toUpperCase() === "SUCCESS"
                              ? "✓"
                              : tx.status?.toUpperCase() === "FAILED"
                                ? "✕"
                                : "●"}
                          </span>

                          {tx.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  filteredTransactions.length,
                )}
                –
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredTransactions.length,
                )}{" "}
                of {filteredTransactions.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ←
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-sm ${
                      currentPage === page
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          TRANSACTION DETAIL DRAWER
      ================================================== */}

      {selectedTransactionId && (
        <TransactionDetails
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
        />
      )}
    </div>
  );
}

/* ======================================================
   STAT CARD
====================================================== */

function StatCard({ title, value, valueClass = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d111a] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className={`mt-4 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

/* ======================================================
   FILTER
====================================================== */

function FilterSelect({ value, onChange, options, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-800 bg-[#0d111a] px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
      aria-label={label}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "ALL" ? `${label}: All` : option}
        </option>
      ))}
    </select>
  );
}
