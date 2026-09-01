import React, { useEffect, useState } from "react";
import "./Dashboard.css";

/*
|--------------------------------------------------------------------------
| API CONFIG
|--------------------------------------------------------------------------
| Change only these URLs when connecting your Express backend.
|
| Expected backend endpoints:
|
| GET /api/analytics/dashboard
| GET /api/transactions
| GET /api/audit
|
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Icons
|--------------------------------------------------------------------------
*/

const Icon = ({ name, size = 20 }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),

    transaction: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    ),

    recovery: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M20 11a8 8 0 0 0-14.9-4" />
        <path d="M3 4v5h5" />
        <path d="M4 13a8 8 0 0 0 14.9 4" />
        <path d="M21 20v-5h-5" />
      </svg>
    ),

    analytics: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M7 16l4-5 3 2 5-7" />
      </svg>
    ),

    audit: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M6 3h12v18H6z" />
        <path d="M9 7h6" />
        <path d="M9 11h6" />
        <path d="M9 15h4" />
      </svg>
    ),

    settings: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),

    bell: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    ),

    arrowUp: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M5 12l7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    ),

    arrowDown: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M5 12l7 7 7-7" />
        <path d="M12 5v14" />
      </svg>
    ),

    rupee: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M6 5h12" />
        <path d="M6 9h9" />
        <path d="M9 5c5 0 5 8 0 8H6l8 6" />
      </svg>
    ),

    brain: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 3 5h2" />
        <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-3 5h-2" />
        <path d="M12 4v16" />
        <path d="M7 9h2" />
        <path d="M15 9h2" />
        <path d="M7 15h2" />
        <path d="M15 15h2" />
      </svg>
    ),

    check: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M5 12l4 4L19 6" />
      </svg>
    ),

    warning: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M12 3L22 20H2L12 3z" />
        <path d="M12 9v5" />
        <circle cx="12" cy="17" r=".7" />
      </svg>
    ),

    menu: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),

    logout: (
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M10 5H5v14h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </svg>
    ),
  };

  return <span className="icon">{icons[name]}</span>;
};

/*
|--------------------------------------------------------------------------
| Demo Data
|--------------------------------------------------------------------------
| Used until your backend endpoints are connected.
*/

const demoStats = {
  revenueAtRisk: 482500,
  recoveredRevenue: 231400,
  recoveryRate: 47.8,
  recoveryAttempts: 67,
  transactionsAnalyzed: 100,
  successfulRecoveries: 48,
};

const demoTransactions = [
  {
    id: "TXN_8F29A1",
    customer: "Rahul Sharma",
    amount: 4999,
    method: "UPI",
    reason: "Bank Timeout",
    aiDecision: "Retry Payment",
    confidence: 91,
    status: "Recovered",
  },
  {
    id: "TXN_7B31C9",
    customer: "Priya Mehta",
    amount: 12500,
    method: "Card",
    reason: "Insufficient Funds",
    aiDecision: "Payment Reminder",
    confidence: 94,
    status: "Pending",
  },
  {
    id: "TXN_6D82K4",
    customer: "Arjun Das",
    amount: 8200,
    method: "Card",
    reason: "Network Error",
    aiDecision: "Retry Payment",
    confidence: 88,
    status: "Recovered",
  },
  {
    id: "TXN_4A12P8",
    customer: "Sneha Roy",
    amount: 3500,
    method: "UPI",
    reason: "Payment Abandoned",
    aiDecision: "Payment Reminder",
    confidence: 86,
    status: "Pending",
  },
  {
    id: "TXN_3K92L1",
    customer: "Aman Gupta",
    amount: 15000,
    method: "Card",
    reason: "Card Declined",
    aiDecision: "Escalate",
    confidence: 97,
    status: "Escalated",
  },
];

const demoAuditLogs = [
  {
    time: "2 min ago",
    transaction: "TXN_8F29A1",
    event: "Payment retry executed",
    result: "SUCCESS",
  },
  {
    time: "8 min ago",
    transaction: "TXN_7B31C9",
    event: "Payment reminder scheduled",
    result: "APPROVED",
  },
  {
    time: "14 min ago",
    transaction: "TXN_6D82K4",
    event: "Policy validation passed",
    result: "APPROVED",
  },
  {
    time: "22 min ago",
    transaction: "TXN_4A12P8",
    event: "AI recovery decision generated",
    result: "APPROVED",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(value);
};

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export default function Dashboard() {
  const [stats, setStats] = useState(demoStats);
  const [transactions, setTransactions] = useState(demoTransactions);
  const [auditLogs, setAuditLogs] = useState(demoAuditLogs);

  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  /*
  |--------------------------------------------------------------------------
  | Fetch dashboard data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Dashboard API unavailable");
        }

        const data = await response.json();

        /*
         * Adapt these fields according to your actual
         * analyticsController response.
         */

        if (data.stats) {
          setStats(data.stats);
        }

        if (data.transactions) {
          setTransactions(data.transactions);
        }

        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      } catch (error) {
        /*
         * Keeping demo data makes the dashboard usable
         * even when the backend is not running.
         */

        console.log("Using dashboard demo data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigation = [
    {
      label: "Dashboard",
      icon: "dashboard",
    },
    {
      label: "Transactions",
      icon: "transaction",
    },
    {
      label: "Recoveries",
      icon: "recovery",
    },
    {
      label: "Analytics",
      icon: "analytics",
    },
    {
      label: "Audit Logs",
      icon: "audit",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="recover-app">
      {/* ================================================================
          SIDEBAR
      ================================================================ */}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">R</div>

          <div>
            <h2>RecoverAI</h2>
            <span>Revenue Intelligence</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">MAIN</p>

          <nav>
            {navigation.map((item) => (
              <button
                key={item.label}
                className={`nav-item ${
                  activeNav === item.label ? "active" : ""
                }`}
                onClick={() => {
                  setActiveNav(item.label);
                  setMobileMenu(false);
                }}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-section sidebar-bottom">
          <p className="sidebar-label">SYSTEM</p>

          <button className="nav-item">
            <Icon name="settings" size={19} />
            <span>Settings</span>
          </button>

          <button
            className="nav-item"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <Icon name="logout" size={19} />
            <span>Logout</span>
          </button>
        </div>

        <div className="ai-status-card">
          <div className="ai-status-icon">
            <Icon name="brain" size={19} />
          </div>

          <div>
            <strong>AI Agent Active</strong>

            <span>Recovery engine operational</span>
          </div>

          <div className="status-dot"></div>
        </div>
      </aside>

      {/* Mobile overlay */}

      {mobileMenu && (
        <div className="sidebar-overlay" onClick={() => setMobileMenu(false)} />
      )}

      {/* ================================================================
          MAIN CONTENT
      ================================================================ */}

      <main className="main-content">
        {/* ==============================================================
            HEADER
        ============================================================== */}

        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(true)}
          >
            <Icon name="menu" size={23} />
          </button>

          <div className="page-heading">
            <h1>{activeNav}</h1>
            <p>Monitor your revenue recovery performance.</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button notification-button">
              <Icon name="bell" size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="merchant-profile">
              <div className="merchant-avatar">NS</div>

              <div className="merchant-info">
                <strong>Merchant Account</strong>
                <span>Administrator</span>
              </div>

              <span className="profile-arrow">▾</span>
            </div>
          </div>
        </header>

        {/* ==============================================================
            CONTENT
        ============================================================== */}

        <div className="dashboard-content">
          {/* ============================================================
              WELCOME
          ============================================================ */}

          <section className="welcome-row">
            <div>
              <h2>Good morning 👋</h2>

              <p>Here's what's happening with your revenue recovery today.</p>
            </div>

            <button
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              ↻<span>{loading ? "Refreshing..." : "Refresh data"}</span>
            </button>
          </section>

          {/* ============================================================
              KPI CARDS
          ============================================================ */}

          <section className="stats-grid">
            {/* Revenue At Risk */}

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon risk">
                  <Icon name="warning" size={21} />
                </div>

                <span className="stat-badge neutral">Today</span>
              </div>

              <p className="stat-label">Revenue at Risk</p>

              <h3>{formatCurrency(stats.revenueAtRisk)}</h3>

              <div className="stat-footer">
                <span className="trend neutral">100 transactions</span>

                <span>requiring attention</span>
              </div>
            </div>

            {/* Recovered Revenue */}

            <div className="stat-card featured-stat">
              <div className="stat-card-top">
                <div className="stat-icon recovered">
                  <Icon name="rupee" size={21} />
                </div>

                <span className="stat-badge positive">+18.4%</span>
              </div>

              <p className="stat-label">Recovered Revenue</p>

              <h3>{formatCurrency(stats.recoveredRevenue)}</h3>

              <div className="stat-footer">
                <span className="trend positive">
                  <Icon name="arrowUp" size={13} />
                  18.4%
                </span>

                <span>vs previous period</span>
              </div>
            </div>

            {/* Recovery Rate */}

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon ai">
                  <Icon name="brain" size={21} />
                </div>

                <span className="stat-badge positive">Healthy</span>
              </div>

              <p className="stat-label">Recovery Rate</p>

              <h3>{stats.recoveryRate}%</h3>

              <div className="stat-footer">
                <div className="progress-mini">
                  <div
                    style={{
                      width: `${stats.recoveryRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recovery Attempts */}

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon attempts">
                  <Icon name="recovery" size={21} />
                </div>

                <span className="stat-badge neutral">Automated</span>
              </div>

              <p className="stat-label">Recovery Attempts</p>

              <h3>{formatNumber(stats.recoveryAttempts)}</h3>

              <div className="stat-footer">
                <span className="trend positive">
                  {stats.successfulRecoveries}
                </span>

                <span>successful recoveries</span>
              </div>
            </div>
          </section>

          {/* ============================================================
              SECOND ROW
          ============================================================ */}

          <section className="dashboard-grid">
            {/* Recovery Overview */}

            <div className="panel recovery-overview">
              <div className="panel-header">
                <div>
                  <h3>Recovery Overview</h3>

                  <p>Revenue recovery performance</p>
                </div>

                <select className="period-select">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>

              <div className="chart-container">
                <div className="chart-y-axis">
                  <span>₹80K</span>
                  <span>₹60K</span>
                  <span>₹40K</span>
                  <span>₹20K</span>
                  <span>₹0</span>
                </div>

                <div className="chart">
                  <div className="chart-grid">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <svg
                    className="chart-svg"
                    viewBox="0 0 700 250"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="recoveryGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#468FEA"
                          stopOpacity="0.24"
                        />

                        <stop
                          offset="100%"
                          stopColor="#468FEA"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="
                        M0 210
                        C60 190 75 180 110 188
                        C150 198 160 155 210 162
                        C250 168 270 130 310 145
                        C355 163 370 108 415 120
                        C455 130 480 92 520 104
                        C555 115 575 62 615 76
                        C650 88 670 48 700 35
                        L700 250
                        L0 250
                        Z
                      "
                      fill="url(#recoveryGradient)"
                    />

                    <path
                      d="
                        M0 210
                        C60 190 75 180 110 188
                        C150 198 160 155 210 162
                        C250 168 270 130 310 145
                        C355 163 370 108 415 120
                        C455 130 480 92 520 104
                        C555 115 575 62 615 76
                        C650 88 670 48 700 35
                      "
                      fill="none"
                      stroke="#468FEA"
                      strokeWidth="3"
                    />
                  </svg>

                  <div className="chart-x-axis">
                    <span>Aug 26</span>
                    <span>Aug 27</span>
                    <span>Aug 28</span>
                    <span>Aug 29</span>
                    <span>Aug 30</span>
                    <span>Aug 31</span>
                    <span>Sep 1</span>
                  </div>
                </div>
              </div>

              <div className="chart-legend">
                <div>
                  <span className="legend-dot at-risk-dot"></span>
                  Revenue at risk
                </div>

                <div>
                  <span className="legend-dot recovered-dot"></span>
                  Recovered revenue
                </div>
              </div>
            </div>

            {/* AI Performance */}

            <div className="panel ai-performance">
              <div className="panel-header">
                <div>
                  <h3>AI Agent Performance</h3>

                  <p>Decision distribution</p>
                </div>

                <div className="ai-live">
                  <span></span>
                  Live
                </div>
              </div>

              <div className="ai-score">
                <div className="score-circle">
                  <div className="score-inner">
                    <strong>92%</strong>
                    <span>Accuracy</span>
                  </div>
                </div>

                <div className="score-description">
                  <strong>High confidence</strong>

                  <p>
                    AI decisions are performing within expected confidence
                    thresholds.
                  </p>
                </div>
              </div>

              <div className="decision-list">
                <div className="decision-row">
                  <div>
                    <span className="decision-indicator retry"></span>
                    Retry Payment
                  </div>
                  <strong>42%</strong>
                </div>

                <div className="decision-row">
                  <div>
                    <span className="decision-indicator reminder"></span>
                    Payment Reminder
                  </div>
                  <strong>31%</strong>
                </div>

                <div className="decision-row">
                  <div>
                    <span className="decision-indicator escalate"></span>
                    Escalation
                  </div>
                  <strong>17%</strong>
                </div>

                <div className="decision-row">
                  <div>
                    <span className="decision-indicator no-action"></span>
                    No Action
                  </div>
                  <strong>10%</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              TRANSACTIONS
          ============================================================ */}

          <section className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <h3>Recovery Queue</h3>

                <p>Recent failed transactions requiring recovery decisions.</p>
              </div>

              <button className="view-all-button">View all →</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Failure Reason</th>
                    <th>AI Recommendation</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className="transaction-id">{transaction.id}</span>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {transaction.customer
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <span>{transaction.customer}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="amount">
                          {formatCurrency(transaction.amount)}
                        </strong>

                        <small>{transaction.method}</small>
                      </td>

                      <td>
                        <span className="failure-reason">
                          {transaction.reason}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`decision-pill ${
                            transaction.aiDecision
                              .toLowerCase()
                              .includes("retry")
                              ? "retry-pill"
                              : transaction.aiDecision
                                    .toLowerCase()
                                    .includes("reminder")
                                ? "reminder-pill"
                                : "escalate-pill"
                          }`}
                        >
                          {transaction.aiDecision}
                        </span>
                      </td>

                      <td>
                        <div className="confidence">
                          <div className="confidence-bar">
                            <span
                              style={{
                                width: `${transaction.confidence}%`,
                              }}
                            />
                          </div>

                          <strong>{transaction.confidence}%</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-pill ${transaction.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          <span></span>

                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ============================================================
              AUDIT + RECOVERY SUMMARY
          ============================================================ */}

          <section className="bottom-grid">
            {/* Audit */}

            <div className="panel audit-panel">
              <div className="panel-header">
                <div>
                  <h3>Recent Audit Activity</h3>

                  <p>Every AI decision and action is recorded.</p>
                </div>

                <button className="view-all-button">View logs →</button>
              </div>

              <div className="audit-list">
                {auditLogs.map((log, index) => (
                  <div className="audit-item" key={index}>
                    <div className="audit-icon">
                      <Icon name="check" size={15} />
                    </div>

                    <div className="audit-content">
                      <strong>{log.event}</strong>

                      <span>{log.transaction}</span>
                    </div>

                    <div className="audit-meta">
                      <span className="audit-result">{log.result}</span>

                      <small>{log.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery Summary */}

            <div className="panel recovery-summary">
              <div className="panel-header">
                <div>
                  <h3>Recovery Summary</h3>

                  <p>Today's performance</p>
                </div>
              </div>

              <div className="summary-number">
                <span>Total recovered</span>

                <strong>{formatCurrency(stats.recoveredRevenue)}</strong>
              </div>

              <div className="summary-progress">
                <div className="summary-progress-header">
                  <span>Recovery target</span>

                  <strong>75%</strong>
                </div>

                <div className="summary-progress-bar">
                  <span
                    style={{
                      width: `${Math.min(stats.recoveryRate, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="summary-stats">
                <div>
                  <span>Analyzed</span>
                  <strong>{stats.transactionsAnalyzed}</strong>
                </div>

                <div>
                  <span>Recovered</span>
                  <strong>{stats.successfulRecoveries}</strong>
                </div>

                <div>
                  <span>Failed</span>
                  <strong>
                    {Math.max(
                      stats.recoveryAttempts - stats.successfulRecoveries,
                      0,
                    )}
                  </strong>
                </div>
              </div>

              <div className="policy-status">
                <div className="policy-check">
                  <Icon name="check" size={16} />
                </div>

                <div>
                  <strong>Policy Engine Healthy</strong>

                  <span>All recovery actions are being validated.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
